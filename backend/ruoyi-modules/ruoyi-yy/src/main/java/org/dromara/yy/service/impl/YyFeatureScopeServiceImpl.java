package org.dromara.yy.service.impl;

import lombok.RequiredArgsConstructor;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.vo.YyFeatureScopeVo;
import org.dromara.yy.domain.vo.YyServiceLicenseBindingVo;
import org.dromara.yy.service.IYyFeatureScopeService;
import org.dromara.yy.service.IYyServiceProductionService;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

@RequiredArgsConstructor
@Service
public class YyFeatureScopeServiceImpl implements IYyFeatureScopeService {

    static final String COLLABORATION_OPEN_SETTINGS = "collaboration-open-settings";

    private static final String LICENSE_ACTIVE = "active";
    private static final String LICENSE_MISSING = "missing";
    private static final String LICENSE_EXPIRED = "expired";
    private static final String LICENSE_NOT_APPLICABLE = "not_applicable";
    private static final String PLUGIN_NOT_APPLICABLE = "not_applicable";
    private static final String APPROVAL_NOT_APPLICABLE = "not_applicable";
    private static final String DATE_TIME_PATTERN = "yyyy-MM-dd HH:mm:ss";

    private final IYyServiceProductionService yyServiceProductionService;

    @Override
    public List<YyFeatureScopeVo> listFeatureScopes(List<String> featureKeys) {
        List<String> normalized = normalizeFeatureKeys(featureKeys);
        if (normalized.isEmpty()) {
            return List.of();
        }
        List<YyServiceLicenseBindingVo> collaborationLicenses = normalized.contains(COLLABORATION_OPEN_SETTINGS)
            ? yyServiceProductionService.queryLicenseBindings(null)
            : List.of();
        List<YyFeatureScopeVo> results = new ArrayList<>(normalized.size());
        for (String featureKey : normalized) {
            results.add(COLLABORATION_OPEN_SETTINGS.equals(featureKey)
                ? buildCollaborationOpenSettingsScope(collaborationLicenses)
                : buildNotApplicableScope(featureKey));
        }
        return results;
    }

    private List<String> normalizeFeatureKeys(List<String> featureKeys) {
        if (featureKeys == null || featureKeys.isEmpty()) {
            return List.of();
        }
        List<String> results = new ArrayList<>();
        for (String item : featureKeys) {
            String normalized = StringUtils.trimToEmpty(item);
            if (StringUtils.isBlank(normalized) || results.contains(normalized)) {
                continue;
            }
            results.add(normalized);
        }
        return results;
    }

    private YyFeatureScopeVo buildCollaborationOpenSettingsScope(List<YyServiceLicenseBindingVo> licenses) {
        YyFeatureScopeVo vo = baseScope(COLLABORATION_OPEN_SETTINGS);
        LicenseResolution resolution = resolveLicense(licenses);
        vo.setLicenseState(resolution.licenseState());
        vo.setGateCopy(resolveCollaborationGateCopy(resolution.licenseState()));
        vo.setLicenseSummary(buildLicenseSummary(resolution.license()));
        return vo;
    }

    private YyFeatureScopeVo buildNotApplicableScope(String featureKey) {
        YyFeatureScopeVo vo = baseScope(featureKey);
        vo.setLicenseState(LICENSE_NOT_APPLICABLE);
        vo.setGateCopy("当前能力授权聚合尚未接入，本次返回 not_applicable 门禁态。");
        return vo;
    }

    private YyFeatureScopeVo baseScope(String featureKey) {
        YyFeatureScopeVo vo = new YyFeatureScopeVo();
        vo.setFeatureKey(featureKey);
        vo.setPluginState(PLUGIN_NOT_APPLICABLE);
        vo.setApprovalState(APPROVAL_NOT_APPLICABLE);
        vo.setPluginSummary(null);
        return vo;
    }

    private LicenseResolution resolveLicense(List<YyServiceLicenseBindingVo> licenses) {
        if (licenses == null || licenses.isEmpty()) {
            return new LicenseResolution(LICENSE_MISSING, null);
        }
        Date now = new Date();
        YyServiceLicenseBindingVo active = licenses.stream()
            .filter(this::isActiveStatus)
            .filter(item -> !isExpired(item, now))
            .min(Comparator.comparing(this::expireTimeOrMax))
            .orElse(null);
        if (active != null) {
            return new LicenseResolution(LICENSE_ACTIVE, active);
        }
        YyServiceLicenseBindingVo fallback = licenses.stream()
            .filter(Objects::nonNull)
            .min(Comparator.comparing(this::expireTimeOrMax))
            .orElse(null);
        return new LicenseResolution(LICENSE_EXPIRED, fallback);
    }

    private boolean isActiveStatus(YyServiceLicenseBindingVo item) {
        return item != null && "ACTIVE".equalsIgnoreCase(StringUtils.defaultIfBlank(item.getStatus(), ""));
    }

    private boolean isExpired(YyServiceLicenseBindingVo item, Date now) {
        return item != null && item.getExpireTime() != null && item.getExpireTime().before(now);
    }

    private Date expireTimeOrMax(YyServiceLicenseBindingVo item) {
        return item == null || item.getExpireTime() == null ? new Date(Long.MAX_VALUE) : item.getExpireTime();
    }

    private String resolveCollaborationGateCopy(String licenseState) {
        return switch (licenseState) {
            case LICENSE_ACTIVE -> "当前协作许可证已生效，可继续维护绑定门店和续期策略。";
            case LICENSE_EXPIRED -> "当前协作许可证已过期，仍可在开通设置里编辑并续期。";
            default -> "当前协作许可证待开通，仍可在开通设置里创建或补开许可证。";
        };
    }

    private YyFeatureScopeVo.LicenseSummary buildLicenseSummary(YyServiceLicenseBindingVo license) {
        if (license == null) {
            return null;
        }
        YyFeatureScopeVo.LicenseSummary summary = new YyFeatureScopeVo.LicenseSummary();
        summary.setLicenseKey(StringUtils.defaultIfBlank(license.getLicenseKey(), ""));
        summary.setPlanName(StringUtils.defaultIfBlank(license.getPlanName(), ""));
        summary.setExpireTime(formatDateTime(license.getExpireTime()));
        summary.setBoundStoreIds(StringUtils.defaultIfBlank(license.getBoundStoreIds(), ""));
        return summary;
    }

    private String formatDateTime(Date value) {
        if (value == null) {
            return "";
        }
        return new SimpleDateFormat(DATE_TIME_PATTERN, Locale.CHINA).format(value);
    }

    private record LicenseResolution(String licenseState, YyServiceLicenseBindingVo license) {
    }
}
