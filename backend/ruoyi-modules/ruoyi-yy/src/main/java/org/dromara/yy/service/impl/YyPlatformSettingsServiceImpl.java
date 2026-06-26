package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.apache.commons.lang3.StringUtils;
import org.dromara.yy.domain.YyAsyncTask;
import org.dromara.yy.domain.bo.YyChannelAccountBo;
import org.dromara.yy.domain.bo.YyChannelSyncLogBo;
import org.dromara.yy.domain.bo.YyNotificationLogBo;
import org.dromara.yy.domain.bo.YyNotificationTemplateBo;
import org.dromara.yy.domain.vo.YyChannelAccountVo;
import org.dromara.yy.domain.vo.YyChannelSyncLogVo;
import org.dromara.yy.domain.vo.YyNotificationLogVo;
import org.dromara.yy.domain.vo.YyNotificationTemplateVo;
import org.dromara.yy.domain.vo.YyPlatformActionHintVo;
import org.dromara.yy.domain.vo.YyPlatformAsyncTaskVo;
import org.dromara.yy.domain.vo.YyPlatformBackupRecoveryVo;
import org.dromara.yy.domain.vo.YyPlatformEvidenceVo;
import org.dromara.yy.domain.vo.YyPlatformIntegrationStatusVo;
import org.dromara.yy.domain.vo.YyPlatformLoginRiskPolicyVo;
import org.dromara.yy.domain.vo.YyPlatformMeituanReviewTraceVo;
import org.dromara.yy.domain.vo.YyPlatformNotificationRuleVo;
import org.dromara.yy.domain.vo.YyPlatformOpenApiAppVo;
import org.dromara.yy.domain.vo.YyPlatformServicePackageStatusVo;
import org.dromara.yy.domain.vo.YyServiceLicenseBindingVo;
import org.dromara.yy.mapper.YyAsyncTaskMapper;
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
    private final YyAsyncTaskMapper yyAsyncTaskMapper;

    public YyPlatformSettingsServiceImpl(
        IYyChannelAccountService yyChannelAccountService,
        IYyChannelSyncLogService yyChannelSyncLogService,
        IYyNotificationTemplateService yyNotificationTemplateService,
        IYyNotificationLogService yyNotificationLogService,
        IYyServiceProductionService yyServiceProductionService,
        YyAsyncTaskMapper yyAsyncTaskMapper
    ) {
        this.yyChannelAccountService = yyChannelAccountService;
        this.yyChannelSyncLogService = yyChannelSyncLogService;
        this.yyNotificationTemplateService = yyNotificationTemplateService;
        this.yyNotificationLogService = yyNotificationLogService;
        this.yyServiceProductionService = yyServiceProductionService;
        this.yyAsyncTaskMapper = yyAsyncTaskMapper;
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
    public List<YyPlatformLoginRiskPolicyVo> listLoginRiskPolicies() {
        YyPlatformLoginRiskPolicyVo baseline = new YyPlatformLoginRiskPolicyVo();
        baseline.setPolicyCode("STAFF_LOGIN_RISK");
        baseline.setPolicyName("Staff login risk baseline");
        baseline.setRiskDimension("DEVICE/IP/MFA");
        baseline.setGuardScope("员工工作台登录");
        baseline.setStatus("scaffold");
        baseline.getEvidence().add(buildEvidence("staff_session", "/login", "ready", "员工账号密码登录已接线，设备指纹和二次校验未接线", "", null));
        baseline.getNextActions().add(buildAction("enable_device_fingerprint", "Enable device fingerprint", false, "待接真实设备指纹 SDK"));

        YyPlatformLoginRiskPolicyVo abnormal = new YyPlatformLoginRiskPolicyVo();
        abnormal.setPolicyCode("ABNORMAL_LOGIN_ALERT");
        abnormal.setPolicyName("Abnormal IP and geo alert");
        abnormal.setRiskDimension("IP/GEO/ALERT");
        abnormal.setGuardScope("门店员工与平台管理员");
        abnormal.setStatus("scaffold");
        abnormal.getEvidence().add(buildEvidence("risk_scaffold", "ABNORMAL_LOGIN_ALERT", "scaffold", "缺少异常登录事件账本与告警记录", "", null));
        abnormal.getNextActions().add(buildAction("bind_second_factor", "Bind second factor", false, "待接短信/邮箱二次校验"));
        return List.of(baseline, abnormal);
    }

    @Override
    public List<YyPlatformOpenApiAppVo> listOpenApiApps() {
        YyPlatformOpenApiAppVo erp = new YyPlatformOpenApiAppVo();
        erp.setAppCode("ERP-SANDBOX");
        erp.setAppName("ERP sandbox app");
        erp.setAuthMode("API_KEY + SIGNATURE");
        erp.setRateLimitLabel("60 req/min");
        erp.setSandboxBaseUrl("https://sandbox.api.evanshine.me/open");
        erp.setStatus("scaffold");
        erp.getEvidence().add(buildEvidence("open_api_scaffold", "ERP-SANDBOX", "scaffold", "开放 API 门户、签名校验和限流账本未落地", "", null));
        erp.getNextActions().add(buildAction("issue_api_key", "Issue API key", false, "待接 API key 发放与吊销"));

        YyPlatformOpenApiAppVo crm = new YyPlatformOpenApiAppVo();
        crm.setAppCode("CRM-READONLY");
        crm.setAppName("CRM read-only app");
        crm.setAuthMode("API_KEY");
        crm.setRateLimitLabel("30 req/min");
        crm.setSandboxBaseUrl("https://sandbox.api.evanshine.me/open");
        crm.setStatus("scaffold");
        crm.getEvidence().add(buildEvidence("channel_bridge", "CRM-READONLY", "scaffold", "仅存在内部渠道 facade，未暴露企业开放 API", "", null));
        crm.getNextActions().add(buildAction("publish_openapi_docs", "Publish OpenAPI docs", false, "待补沙箱文档与签名示例"));
        return List.of(erp, crm);
    }

    @Override
    public List<YyPlatformAsyncTaskVo> listAsyncTasks() {
        List<YyAsyncTask> taskRows = safeList(yyAsyncTaskMapper.selectList(Wrappers.<YyAsyncTask>lambdaQuery()
            .orderByDesc(YyAsyncTask::getCreateTime)));
        if (!taskRows.isEmpty()) {
            return buildAsyncTaskRows(taskRows);
        }

        YyPlatformAsyncTaskVo exportTask = new YyPlatformAsyncTaskVo();
        exportTask.setTaskType("EXPORT");
        exportTask.setTaskName("Order export queue");
        exportTask.setQueueName("platform-export");
        exportTask.setLatestRunStatus("NOT_CONNECTED");
        exportTask.setRetentionPolicy("7 days");
        exportTask.setStatus("scaffold");
        exportTask.getEvidence().add(buildEvidence("export_scaffold", "platform-export", "scaffold", "当前导出仍由各 owner 直接处理，未进入统一任务中心", "", null));
        exportTask.getNextActions().add(buildAction("bind_export_worker", "Bind export worker", false, "待补统一任务账本和下载过期策略"));

        YyPlatformAsyncTaskVo mediaTask = new YyPlatformAsyncTaskVo();
        mediaTask.setTaskType("MEDIA_PIPELINE");
        mediaTask.setTaskName("Image process queue");
        mediaTask.setQueueName("platform-media");
        mediaTask.setLatestRunStatus("NOT_CONNECTED");
        mediaTask.setRetentionPolicy("3 days");
        mediaTask.setStatus("scaffold");
        mediaTask.getEvidence().add(buildEvidence("photo_pipeline", "platform-media", "scaffold", "图片处理、通知和报表汇总缺少统一 worker 与失败重试", "", null));
        mediaTask.getNextActions().add(buildAction("bind_retry_policy", "Bind retry policy", false, "待补失败重试和任务审计"));
        return List.of(exportTask, mediaTask);
    }

    private List<YyPlatformAsyncTaskVo> buildAsyncTaskRows(List<YyAsyncTask> rows) {
        Map<String, List<YyAsyncTask>> grouped = new LinkedHashMap<>();
        for (YyAsyncTask row : rows) {
            String taskType = StringUtils.defaultIfBlank(row.getTaskType(), "UNKNOWN");
            grouped.computeIfAbsent(taskType, ignored -> new ArrayList<>()).add(row);
        }
        List<YyPlatformAsyncTaskVo> result = new ArrayList<>();
        for (Map.Entry<String, List<YyAsyncTask>> entry : grouped.entrySet()) {
            YyAsyncTask latest = entry.getValue().stream()
                .max(Comparator.comparing(YyAsyncTask::getCreateTime, Comparator.nullsLast(Comparator.naturalOrder())))
                .orElse(entry.getValue().get(0));
            YyPlatformAsyncTaskVo vo = new YyPlatformAsyncTaskVo();
            vo.setTaskType(entry.getKey());
            vo.setTaskName(StringUtils.defaultIfBlank(latest.getTaskName(), entry.getKey()));
            vo.setQueueName(StringUtils.defaultIfBlank(latest.getQueueName(), "platform-export"));
            vo.setLatestRunStatus(StringUtils.defaultIfBlank(latest.getRunStatus(), latest.getStatus()));
            vo.setRetentionPolicy(resolveRetentionPolicy(latest));
            vo.setStatus(taskCenterStatus(latest.getStatus()));
            vo.getEvidence().add(buildEvidence(
                "yy_async_task",
                StringUtils.defaultString(latest.getTaskNo()),
                StringUtils.defaultString(latest.getStatus()),
                StringUtils.defaultIfBlank(latest.getAuditNote(), latest.getErrorMessage()),
                "",
                latest.getUpdateTime() == null ? latest.getCreateTime() : latest.getUpdateTime()
            ));
            vo.getNextActions().add(buildAction("open_task_detail", "Open task detail", false, "Task detail drawer is not implemented in this package"));
            result.add(vo);
        }
        return result;
    }

    private static String resolveRetentionPolicy(YyAsyncTask task) {
        if (task.getExpireTime() == null) {
            return "not configured";
        }
        return "expires at " + task.getExpireTime();
    }

    private static String taskCenterStatus(String status) {
        String normalized = normalizeCode(status);
        if ("COMPLETED".equals(normalized) || "SUCCESS".equals(normalized)) {
            return "ready";
        }
        if ("FAILED".equals(normalized) || "EXPIRED".equals(normalized) || "CANCELLED".equals(normalized)) {
            return "retired";
        }
        return "scaffold";
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
    public List<YyPlatformBackupRecoveryVo> listBackupRecoveryPlans() {
        YyPlatformBackupRecoveryVo primary = new YyPlatformBackupRecoveryVo();
        primary.setPlanCode("PITR-PRIMARY");
        primary.setPlanName("Primary DB PITR");
        primary.setBackupScope("PostgreSQL + object storage");
        primary.setRecoveryTarget("RPO <= 15m / RTO <= 4h");
        primary.setStatus("scaffold");
        primary.getEvidence().add(buildEvidence("deployment_doc", "backup-strategy", "scaffold", "仓库内有备份说明，但未建立恢复演练账本", "", null));
        primary.getNextActions().add(buildAction("run_recovery_drill", "Run recovery drill", false, "待补恢复演练记录和告警"));

        YyPlatformBackupRecoveryVo objectVersioning = new YyPlatformBackupRecoveryVo();
        objectVersioning.setPlanCode("OSS-VERSIONING");
        objectVersioning.setPlanName("Object versioning and lifecycle");
        objectVersioning.setBackupScope("客片 OSS / 资源文件");
        objectVersioning.setRecoveryTarget("Version history + lifecycle audit");
        objectVersioning.setStatus("scaffold");
        objectVersioning.getEvidence().add(buildEvidence("resource_owner", "oss-versioning", "scaffold", "对象版本化、生命周期和恢复证据未接线", "", null));
        objectVersioning.getNextActions().add(buildAction("bind_object_versioning", "Bind object versioning", false, "待接对象存储版本化配置"));
        return List.of(primary, objectVersioning);
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

    @Override
    public List<YyPlatformMeituanReviewTraceVo> listMeituanReviewTraces() {
        List<YyChannelAccountVo> accounts = safeList(yyChannelAccountService.queryList(new YyChannelAccountBo()));
        List<YyChannelSyncLogVo> logs = safeList(yyChannelSyncLogService.queryList(new YyChannelSyncLogBo()));
        YyChannelAccountVo meituanAccount = latestByChannel(accounts).get("MEITUAN");
        YyChannelSyncLogVo meituanLog = latestLogByChannel(logs).get("MEITUAN");

        YyPlatformMeituanReviewTraceVo trace = new YyPlatformMeituanReviewTraceVo();
        trace.setPluginCode("MEITUAN_REVIEW_TRACE");
        trace.setPluginName("Meituan negative-review trace");
        trace.setReviewChannel("MEITUAN");
        trace.setTraceStatus(meituanAccount == null ? "PLUGIN_NOT_OPENED" : "AUTH_READY_BUT_REVIEW_SYNC_MISSING");
        trace.setLatestSyncTime(meituanLog == null ? null : meituanLog.getCreateTime());
        trace.setStatus("scaffold");
        trace.getEvidence().add(buildEvidence("yy_channel_account", "MEITUAN", meituanAccount == null ? "scaffold" : meituanAccount.getStatus(), meituanAccount == null ? "缺少美团插件授权 owner" : "已有美团账号授权骨架", "", meituanAccount == null ? null : meituanAccount.getUpdateTime()));
        if (meituanLog != null) {
            trace.getEvidence().add(buildEvidence("yy_channel_sync_log", meituanLog.getApiName(), meituanLog.getSuccess(), meituanLog.getErrorMessage(), meituanLog.getRequestId(), meituanLog.getCreateTime()));
        }
        trace.getNextActions().add(buildAction("bind_review_sync", "Bind review sync", false, "待接评价拉取、差评归因和处理工单"));
        return List.of(trace);
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
