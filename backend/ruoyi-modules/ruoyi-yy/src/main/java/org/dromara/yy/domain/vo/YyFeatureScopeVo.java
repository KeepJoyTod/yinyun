package org.dromara.yy.domain.vo;

import lombok.Data;

@Data
public class YyFeatureScopeVo {

    private String featureKey;

    private String licenseState;

    private String pluginState;

    private String approvalState;

    private String gateCopy;

    private LicenseSummary licenseSummary;

    private PluginSummary pluginSummary;

    @Data
    public static class LicenseSummary {

        private String licenseKey;

        private String planName;

        private String expireTime;

        private String boundStoreIds;
    }

    @Data
    public static class PluginSummary {

        private String channelType;

        private String pluginName;

        private String authStatus;

        private String openTip;
    }
}
