package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Data
public class YyCustomerExperienceP1BookingOptionsVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String status;

    private List<ServiceGroupOptionVo> serviceGroups = new ArrayList<>();

    private List<ProfileFieldVo> profileFields = new ArrayList<>();

    private List<EntitlementCandidateVo> entitlementCandidates = new ArrayList<>();

    private YyCustomerExperienceP1AssetSummaryVo assetSummary;

    private List<String> notices = new ArrayList<>();

    @Data
    public static class ServiceGroupOptionVo implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;
        private String serviceGroupId;
        private String name;
        private String description;
        private String capacityLabel;
        private String status;
    }

    @Data
    public static class ProfileFieldVo implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;
        private String key;
        private String label;
        private Boolean required;
        private String inputType;
        private String placeholder;
        private List<String> options = new ArrayList<>();
        private String status;
    }

    @Data
    public static class EntitlementCandidateVo implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;
        private String candidateId;
        private String title;
        private String kind;
        private String status;
        private String amountLabel;
        private String reason;
        private String actionLabel;
    }
}
