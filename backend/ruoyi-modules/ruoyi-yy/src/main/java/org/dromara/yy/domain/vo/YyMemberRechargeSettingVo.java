package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

@Data
public class YyMemberRechargeSettingVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String status;
    private Boolean enabled;
    private String scopeLabel;
    private String gateCopy;
    private Boolean allowManualRecharge;
    private Boolean allowGiftAmount;
    private Boolean allowCrossStore;
    private List<String> supportedChannels;
    private String defaultChannelType;
    private BigDecimal minRechargeAmount;
    private BigDecimal maxRechargeAmount;
    private String notice;
    private String updatedAt;
    private List<GiftRuleVo> giftRules;

    @Data
    public static class GiftRuleVo implements Serializable {

        @Serial
        private static final long serialVersionUID = 1L;

        private String ruleId;
        private String label;
        private BigDecimal rechargeAmount;
        private BigDecimal giftAmount;
        private Boolean enabled;
        private String remark;
    }
}
