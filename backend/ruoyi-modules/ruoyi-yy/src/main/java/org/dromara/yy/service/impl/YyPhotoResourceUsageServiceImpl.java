package org.dromara.yy.service.impl;

import lombok.RequiredArgsConstructor;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.YyPhotoAsset;
import org.dromara.yy.domain.bo.YyPhotoAssetBo;
import org.dromara.yy.domain.bo.YyPhotoResourceSizeBackfillBo;
import org.dromara.yy.domain.vo.YyPhotoAssetVo;
import org.dromara.yy.domain.vo.YyPhotoResourceSizeBackfillVo;
import org.dromara.yy.domain.vo.YyPhotoResourceUsageSummaryVo;
import org.dromara.yy.mapper.YyPhotoAssetMapper;
import org.dromara.yy.service.IYyPhotoAssetService;
import org.dromara.yy.service.IYyPhotoResourceUsageService;
import org.dromara.yy.service.YyPhotoAssetUrlSigner;
import org.dromara.system.service.ISysConfigService;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 璧勬簮鐢ㄩ噺 Service 瀹炵幇
 */
@RequiredArgsConstructor
@Service
public class YyPhotoResourceUsageServiceImpl implements IYyPhotoResourceUsageService {

    private static final String QUOTA_CONFIG_KEY = "yy.resource.defaultQuotaBytes";
    private static final String CLEANUP_ENABLED_CONFIG_KEY = "yy.resource.cleanupPlanEnabled";
    private static final String CLEANUP_RETENTION_CONFIG_KEY = "yy.resource.cleanupRetentionDays";
    private static final long DEFAULT_QUOTA_BYTES = 100L * 1024 * 1024 * 1024;
    private static final int DEFAULT_RETENTION_DAYS = 30;
    private static final int DEFAULT_BACKFILL_LIMIT = 50;
    private static final int MAX_BACKFILL_LIMIT = 200;

    private final IYyPhotoAssetService yyPhotoAssetService;
    private final YyPhotoAssetMapper yyPhotoAssetMapper;
    private final YyPhotoAssetUrlSigner photoAssetUrlSigner;
    private final ISysConfigService sysConfigService;

    @Override
    public YyPhotoResourceUsageSummaryVo getUsageSummary() {
        List<YyPhotoAssetVo> assets = yyPhotoAssetService.queryList(new YyPhotoAssetBo());
        long usedBytes = 0L;
        long missingSizeCount = 0L;
        Map<String, YyPhotoResourceUsageSummaryVo.TypeBreakdownItem> breakdownMap = new LinkedHashMap<>();

        for (YyPhotoAssetVo asset : assets) {
            long size = asset.getFileSizeBytes() == null ? 0L : Math.max(asset.getFileSizeBytes(), 0L);
            if (size <= 0L) {
                missingSizeCount += 1L;
            }
            usedBytes += size;
            String assetType = StringUtils.defaultIfBlank(asset.getAssetType(), "UNCLASSIFIED");
            YyPhotoResourceUsageSummaryVo.TypeBreakdownItem item = breakdownMap.computeIfAbsent(assetType, key -> {
                YyPhotoResourceUsageSummaryVo.TypeBreakdownItem created = new YyPhotoResourceUsageSummaryVo.TypeBreakdownItem();
                created.setAssetType(key);
                created.setAssetCount(0L);
                created.setTotalBytes(0L);
                return created;
            });
            item.setAssetCount(item.getAssetCount() + 1L);
            item.setTotalBytes(item.getTotalBytes() + size);
        }

        long totalQuotaBytes = readLongConfig(QUOTA_CONFIG_KEY, DEFAULT_QUOTA_BYTES);
        long remainingBytes = Math.max(0L, totalQuotaBytes - usedBytes);
        double usagePercent = totalQuotaBytes <= 0 ? 0D : Math.min(100D, (usedBytes * 100D) / totalQuotaBytes);

        YyPhotoResourceUsageSummaryVo summary = new YyPhotoResourceUsageSummaryVo();
        summary.setTotalQuotaBytes(totalQuotaBytes);
        summary.setUsedBytes(usedBytes);
        summary.setRemainingBytes(remainingBytes);
        summary.setUsagePercent(Math.round(usagePercent * 100D) / 100D);
        summary.setMissingSizeCount(missingSizeCount);
        summary.setCleanupPlanEnabled(readBooleanConfig(CLEANUP_ENABLED_CONFIG_KEY, false));
        summary.setCleanupRetentionDays((int) readLongConfig(CLEANUP_RETENTION_CONFIG_KEY, DEFAULT_RETENTION_DAYS));
        summary.setQuotaConfigKey(QUOTA_CONFIG_KEY);
        summary.setCleanupPlanConfigKey(CLEANUP_ENABLED_CONFIG_KEY);
        summary.setCleanupRetentionConfigKey(CLEANUP_RETENTION_CONFIG_KEY);
        summary.setTypeBreakdown(List.copyOf(breakdownMap.values()));
        return summary;
    }

    @Override
    public YyPhotoResourceSizeBackfillVo backfillMissingSize(YyPhotoResourceSizeBackfillBo bo) {
        int limit = normalizeBackfillLimit(bo == null ? null : bo.getLimit());
        List<YyPhotoAssetVo> missingAssets = yyPhotoAssetService.queryList(new YyPhotoAssetBo())
            .stream()
            .filter(this::isMissingSize)
            .limit(limit)
            .toList();

        long attemptedCount = 0L;
        long updatedCount = 0L;
        long skippedCount = 0L;
        long failedCount = 0L;

        for (YyPhotoAssetVo asset : missingAssets) {
            attemptedCount += 1L;
            String objectKey = StringUtils.trimToEmpty(asset.getObjectKey());
            if (StringUtils.isBlank(objectKey)) {
                skippedCount += 1L;
                continue;
            }
            try {
                Long sizeBytes = photoAssetUrlSigner.resolveObjectSizeBytes(objectKey);
                if (sizeBytes == null || sizeBytes <= 0L) {
                    skippedCount += 1L;
                    continue;
                }
                YyPhotoAsset update = new YyPhotoAsset();
                update.setId(asset.getId());
                update.setFileSizeBytes(sizeBytes);
                if (yyPhotoAssetMapper.updateById(update) > 0) {
                    updatedCount += 1L;
                } else {
                    failedCount += 1L;
                }
            } catch (Exception ignored) {
                failedCount += 1L;
            }
        }

        Long remainingMissingSizeCount = getUsageSummary().getMissingSizeCount();
        YyPhotoResourceSizeBackfillVo result = new YyPhotoResourceSizeBackfillVo();
        result.setAttemptedCount(attemptedCount);
        result.setUpdatedCount(updatedCount);
        result.setSkippedCount(skippedCount);
        result.setFailedCount(failedCount);
        result.setRemainingMissingSizeCount(remainingMissingSizeCount);
        result.setMessage(buildBackfillMessage(updatedCount, skippedCount, failedCount, remainingMissingSizeCount));
        return result;
    }

    private boolean isMissingSize(YyPhotoAssetVo asset) {
        return asset != null && (asset.getFileSizeBytes() == null || asset.getFileSizeBytes() <= 0L);
    }

    private int normalizeBackfillLimit(Integer limit) {
        if (limit == null || limit <= 0) {
            return DEFAULT_BACKFILL_LIMIT;
        }
        return Math.min(limit, MAX_BACKFILL_LIMIT);
    }

    private String buildBackfillMessage(long updatedCount, long skippedCount, long failedCount, Long remainingMissingSizeCount) {
        return "updated=" + updatedCount
            + ", skipped=" + skippedCount
            + ", failed=" + failedCount
            + ", remaining=" + (remainingMissingSizeCount == null ? 0L : remainingMissingSizeCount);
    }

    private long readLongConfig(String key, long defaultValue) {
        String raw = sysConfigService.selectConfigByKey(key);
        if (StringUtils.isBlank(raw)) {
            return defaultValue;
        }
        try {
            return Long.parseLong(raw.trim());
        } catch (NumberFormatException ignored) {
            return defaultValue;
        }
    }

    private boolean readBooleanConfig(String key, boolean defaultValue) {
        String raw = sysConfigService.selectConfigByKey(key);
        if (StringUtils.isBlank(raw)) {
            return defaultValue;
        }
        String normalized = raw.trim();
        return "1".equals(normalized) || "true".equalsIgnoreCase(normalized) || "yes".equalsIgnoreCase(normalized);
    }
}
