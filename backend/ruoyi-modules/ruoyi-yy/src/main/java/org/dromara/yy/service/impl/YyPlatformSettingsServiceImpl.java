package org.dromara.yy.service.impl;

import org.apache.commons.lang3.StringUtils;
import org.dromara.yy.domain.bo.YyChannelAccountBo;
import org.dromara.yy.domain.bo.YyChannelSyncLogBo;
import org.dromara.yy.domain.bo.YyNotificationLogBo;
import org.dromara.yy.domain.bo.YyNotificationTemplateBo;
import org.dromara.yy.domain.vo.YyChannelAccountVo;
import org.dromara.yy.domain.vo.YyChannelSyncLogVo;
import org.dromara.yy.domain.vo.YyNotificationLogVo;
import org.dromara.yy.domain.vo.YyNotificationTemplateVo;
import org.dromara.yy.domain.vo.YyPlatformActionHintVo;
import org.dromara.yy.domain.vo.YyPlatformEvidenceVo;
import org.dromara.yy.domain.vo.YyPlatformIntegrationStatusVo;
import org.dromara.yy.domain.vo.YyPlatformNotificationRuleVo;
import org.dromara.yy.domain.vo.YyPlatformServicePackageStatusVo;
import org.dromara.yy.domain.vo.YyServiceLicenseBindingVo;
import org.dromara.yy.service.IYyChannelAccountService;
import org.dromara.yy.service.IYyChannelSyncLogService;
import org.dromara.yy.service.IYyNotificationLogService;
import org.dromara.yy.service.IYyNotificationTemplateService;
import org.dromara.yy.service.IYyPlatformSettingsService;
import org.dromara.yy.service.IYyServiceProductionService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class YyPlatformSettingsServiceImpl implements IYyPlatformSettingsService {

    private static final List<String> BASE_CHANNELS = List.of("DOUYIN_LIFE", "MEITUAN", "WECHAT");

    private final IYyChannelAccountService yyChannelAccountService;
    private final IYyChannelSyncLogService yyChannelSyncLogService;
    private final IYyNotificationTemplateService yyNotificationTemplateService;
    private final IYyNotificationLogService yyNotificationLogService;
    private final IYyServiceProductionService yyServiceProductionService;

    public YyPlatformSettingsServiceImpl(
        IYyChannelAccountService yyChannelAccountService,
        IYyChannelSyncLogService yyChannelSyncLogService,
        IYyNotificationTemplateService yyNotificationTemplateService,
        IYyNotificationLogService yyNotificationLogService,
        IYyServiceProductionService yyServiceProductionService
    ) {
        this.yyChannelAccountService = yyChannelAccountService;
        this.yyChannelSyncLogService = yyChannelSyncLogService;
        this.yyNotificationTemplateService = yyNotificationTemplateService;
        this.yyNotificationLogService = yyNotificationLogService;
        this.yyServiceProductionService = yyServiceProductionService;
    }

    @Override
    public List<YyPlatformIntegrationStatusVo> listIntegrations() {
        List<YyChannelAccountVo> accounts = safeList(yyChannelAccountService.queryList(new YyChannelAccountBo()));
        List<YyChannelSyncLogVo> logs = safeList(yyChannelSyncLogService.queryList(new YyChannelSyncLogBo()));
        Map<String, YyChannelAccountVo> accountByChannel = latestByChannel(accounts);
        Map<String, YyChannelSyncLogVo> logByChannel = latestLogByChannel(logs);
        Set<String> channelTypes = new LinkedHashSet<>(BASE_CHANNELS);
        accountByChannel.keySet().stream().filter(StringUtils::isNotBlank).forEach(channelTypes::add);

        List<YyPlatformIntegrationStatusVo> rows = new ArrayList<>();
        for (String channelType : channelTypes) {
            String normalized = normalizeCode(channelType);
            YyChannelAccountVo account = accountByChannel.get(normalized);
            YyChannelSyncLogVo latestLog = logByChannel.get(normalized);
            YyPlatformIntegrationStatusVo row = new YyPlatformIntegrationStatusVo();
            row.setChannelType(normalized);
            row.setChannelName(channelName(normalized));
            row.setAccountName(account == null ? "" : account.getAccountName());
            row.setAppId(resolveAppId(account));
            row.setWebhookUrl(account == null ? "" : account.getWebhookUrl());
            row.setSpiBaseUrl(resolveSpiBaseUrl(normalized));
            row.setStatus(account == null ? "scaffold" : activeStatus(account.getStatus()) ? "ready" : "retired");
            row.setLatestLogId(latestLog == null ? "" : latestLog.getRequestId());
            row.setLatestSyncTime(latestLog == null ? null : latestLog.getCreateTime());
            row.getEvidence().add(buildEvidence("yy_channel_account", normalized, row.getStatus(), account == null ? "missing account" : account.getStatus(), "", account == null ? null : account.getUpdateTime()));
            if (latestLog != null) {
                row.getEvidence().add(buildEvidence("yy_channel_sync_log", latestLog.getApiName(), latestLog.getSuccess(), latestLog.getErrorMessage(), latestLog.getRequestId(), latestLog.getCreateTime()));
            }
            row.getNextActions().add(buildAction("open_authorization", "Open authorization", false, "Phase 1 is read-only"));
            rows.add(row);
        }
        return rows;
    }

    @Override
    public List<YyPlatformNotificationRuleVo> listNotifications() {
        List<YyNotificationTemplateVo> templates = safeList(yyNotificationTemplateService.queryList(new YyNotificationTemplateBo()));
        List<YyNotificationLogVo> logs = safeList(yyNotificationLogService.queryList(new YyNotificationLogBo()));
        Map<String, List<YyNotificationTemplateVo>> templatesByScene = new LinkedHashMap<>();
        for (YyNotificationTemplateVo template : templates) {
            String scene = StringUtils.defaultIfBlank(template.getScene(), template.getTemplateCode());
            templatesByScene.computeIfAbsent(scene, ignored -> new ArrayList<>()).add(template);
        }

        if (templatesByScene.isEmpty()) {
            YyPlatformNotificationRuleVo empty = new YyPlatformNotificationRuleVo();
            empty.setSceneCode("EMPTY");
            empty.setSceneName("No notification template");
            empty.setEnabled("N");
            empty.setStatus("scaffold");
            empty.getNextActions().add(buildAction("create_template", "Create template", false, "Phase 1 is read-only"));
            return List.of(empty);
        }

        YyNotificationLogVo latestLog = latestNotificationLog(logs);
        List<YyPlatformNotificationRuleVo> rows = new ArrayList<>();
        for (Map.Entry<String, List<YyNotificationTemplateVo>> entry : templatesByScene.entrySet()) {
            List<YyNotificationTemplateVo> sceneTemplates = entry.getValue();
            YyNotificationTemplateVo first = sceneTemplates.get(0);
            YyPlatformNotificationRuleVo row = new YyPlatformNotificationRuleVo();
            row.setSceneCode(entry.getKey());
            row.setSceneName(StringUtils.defaultIfBlank(first.getTitle(), entry.getKey()));
            row.setChannelTypes(sceneTemplates.stream().map(YyNotificationTemplateVo::getChannelType).filter(StringUtils::isNotBlank).distinct().toList());
            row.setEnabled(sceneTemplates.stream().anyMatch(item -> activeStatus(item.getEnabled())) ? "Y" : "N");
            row.setStatus("Y".equals(row.getEnabled()) ? "ready" : "retired");
            row.setLatestSendStatus(latestLog == null ? "" : latestLog.getSendStatus());
            row.setLatestSentTime(latestLog == null ? null : latestLog.getSentTime());
            row.getEvidence().add(buildEvidence("yy_notification_template", first.getTemplateCode(), row.getEnabled(), first.getRemark(), "", first.getUpdateTime()));
            if (latestLog != null) {
                row.getEvidence().add(buildEvidence("yy_notification_log", latestLog.getRequestId(), latestLog.getSendStatus(), latestLog.getErrorMessage(), latestLog.getRequestId(), latestLog.getSentTime()));
            }
            row.getNextActions().add(buildAction("edit_template", "Edit template", false, "Phase 1 is read-only"));
            rows.add(row);
        }
        return rows;
    }

    @Override
    public List<YyPlatformServicePackageStatusVo> listServicePackages(Long storeId) {
        List<YyServiceLicenseBindingVo> licenses = safeList(yyServiceProductionService.queryLicenseBindings(storeId));
        if (licenses.isEmpty()) {
            YyPlatformServicePackageStatusVo empty = new YyPlatformServicePackageStatusVo();
            empty.setPackageCode("YY-BASE");
            empty.setPackageName("Yingyue base package");
            empty.setVersionLabel("Phase 1");
            empty.setStatus("scaffold");
            empty.getNextActions().add(buildAction("renew_or_upgrade", "Renew or upgrade", false, "No license ledger row"));
            return List.of(empty);
        }

        return licenses.stream()
            .sorted(Comparator.comparing(YyServiceLicenseBindingVo::getExpireTime, Comparator.nullsLast(Comparator.naturalOrder())))
            .map(this::mapLicense)
            .toList();
    }

    private YyPlatformServicePackageStatusVo mapLicense(YyServiceLicenseBindingVo license) {
        YyPlatformServicePackageStatusVo row = new YyPlatformServicePackageStatusVo();
        row.setPackageCode(StringUtils.defaultIfBlank(license.getLicenseKey(), "LICENSE-" + license.getId()));
        row.setPackageName(StringUtils.defaultIfBlank(license.getPlanName(), "Service package"));
        row.setVersionLabel("Phase 1");
        row.setStatus(activeStatus(license.getStatus()) ? "ready" : "retired");
        row.setExpireTime(license.getExpireTime());
        row.setBoundStoreIds(license.getBoundStoreIds());
        row.setSeatCount(license.getSeatCount());
        row.getEvidence().add(buildEvidence("yy_service_license_binding", row.getPackageCode(), license.getStatus(), license.getRemark(), "", license.getUpdateTime()));
        row.getNextActions().add(buildAction("renew_or_upgrade", "Renew or upgrade", false, "Phase 1 is read-only"));
        return row;
    }

    private static Map<String, YyChannelAccountVo> latestByChannel(List<YyChannelAccountVo> accounts) {
        Map<String, YyChannelAccountVo> result = new LinkedHashMap<>();
        accounts.stream()
            .sorted(Comparator.comparing(YyChannelAccountVo::getUpdateTime, Comparator.nullsLast(Comparator.reverseOrder())))
            .forEach(item -> result.putIfAbsent(normalizeCode(item.getChannelType()), item));
        return result;
    }

    private static Map<String, YyChannelSyncLogVo> latestLogByChannel(List<YyChannelSyncLogVo> logs) {
        Map<String, YyChannelSyncLogVo> result = new LinkedHashMap<>();
        logs.stream()
            .sorted(Comparator.comparing(YyChannelSyncLogVo::getCreateTime, Comparator.nullsLast(Comparator.reverseOrder())))
            .forEach(item -> result.putIfAbsent(normalizeCode(item.getChannelType()), item));
        return result;
    }

    private static YyNotificationLogVo latestNotificationLog(List<YyNotificationLogVo> logs) {
        return logs.stream()
            .filter(item -> item.getSentTime() != null || item.getCreateTime() != null)
            .max(Comparator.comparing(item -> item.getSentTime() == null ? item.getCreateTime() : item.getSentTime()))
            .orElse(null);
    }

    private static YyPlatformEvidenceVo buildEvidence(String sourceType, String sourceKey, String status, String message, String requestId, java.util.Date eventTime) {
        YyPlatformEvidenceVo vo = new YyPlatformEvidenceVo();
        vo.setSourceType(sourceType);
        vo.setSourceKey(StringUtils.defaultString(sourceKey));
        vo.setStatus(StringUtils.defaultString(status));
        vo.setMessage(StringUtils.defaultString(message));
        vo.setRequestId(StringUtils.defaultString(requestId));
        vo.setEventTime(eventTime);
        return vo;
    }

    private static YyPlatformActionHintVo buildAction(String actionKey, String label, boolean enabled, String reason) {
        YyPlatformActionHintVo vo = new YyPlatformActionHintVo();
        vo.setActionKey(actionKey);
        vo.setLabel(label);
        vo.setEnabled(enabled);
        vo.setReason(reason);
        return vo;
    }

    private static String resolveAppId(YyChannelAccountVo account) {
        if (account == null) {
            return "";
        }
        return StringUtils.defaultIfBlank(account.getServiceMarketAppId(), account.getAppKey());
    }

    private static String resolveSpiBaseUrl(String channelType) {
        if ("DOUYIN_LIFE".equals(channelType)) {
            return "https://api.evanshine.me";
        }
        return "";
    }

    private static boolean activeStatus(String status) {
        String normalized = normalizeCode(status);
        return "ACTIVE".equals(normalized) || "ENABLED".equals(normalized) || "Y".equals(normalized) || "NORMAL".equals(normalized);
    }

    private static String channelName(String channelType) {
        return switch (channelType) {
            case "DOUYIN_LIFE" -> "Douyin Life";
            case "MEITUAN" -> "Meituan";
            case "WECHAT" -> "Wechat";
            default -> channelType;
        };
    }

    private static String normalizeCode(String value) {
        return StringUtils.defaultString(value).trim().toUpperCase(Locale.ROOT);
    }

    private static <T> List<T> safeList(List<T> rows) {
        return rows == null ? List.of() : rows;
    }
}
