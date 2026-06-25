package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
public class YyProductCatalogVo implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private Long productId;
    private Long storeId;
    private String productType;
    private String productName;
    private BigDecimal price;
    private Integer durationMinutes;
    private String status;
    private Integer sort;
    private List<YyProductSkuVo> skus = new ArrayList<>();
    private YyProductDisplayConfigVo displayConfig;
    private YyProductBookingRuleVo bookingRule;
    private List<YyProductRelationVo> relations = new ArrayList<>();
    private List<YyProductChannelConfigVo> channelConfigs = new ArrayList<>();
    private YyProductFulfillmentRuleVo fulfillmentRule;
    private YyProductOrderReadinessVo orderReadiness;
    private YyProductInventoryBindingVo inventoryBinding;
    private YyProductBenefitBindingVo benefitBinding;
}
