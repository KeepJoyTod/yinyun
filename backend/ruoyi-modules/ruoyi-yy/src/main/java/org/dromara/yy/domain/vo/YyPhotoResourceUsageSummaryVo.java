package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * 璧勬簮鐢ㄩ噺姹囨€昏鍥惧璞?
 */
@Data
public class YyPhotoResourceUsageSummaryVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long totalQuotaBytes;

    private Long usedBytes;

    private Long remainingBytes;

    private Double usagePercent;

    private Long missingSizeCount;

    private Boolean cleanupPlanEnabled;

    private Integer cleanupRetentionDays;

    private String quotaConfigKey;

    private String cleanupPlanConfigKey;

    private String cleanupRetentionConfigKey;

    private List<TypeBreakdownItem> typeBreakdown = new ArrayList<>();

    @Data
    public static class TypeBreakdownItem implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private String assetType;

        private Long assetCount;

        private Long totalBytes;
    }
}
