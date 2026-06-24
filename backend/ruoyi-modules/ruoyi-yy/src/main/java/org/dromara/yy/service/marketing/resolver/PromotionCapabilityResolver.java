package org.dromara.yy.service.marketing.resolver;

import org.dromara.yy.domain.vo.YyMarketingCapabilityVo;

import java.util.List;

public class PromotionCapabilityResolver {

    public List<YyMarketingCapabilityVo> resolveDefaults() {
        return List.of(
            capability("MARKETING_CENTER", "营销总览", true, "ready", "品牌级", "营销总览脚手架已就绪，可承接真实账本。"),
            capability("COUPON_TEMPLATE", "券模板与发券", true, "scaffold", "品牌级", "券模板、发券、券实例已按模块化规范搭好脚手架，等待真实营销表灌数。"),
            capability("CAMPAIGN_MANAGEMENT", "活动管理", true, "scaffold", "品牌级", "活动清单与参与记录已就绪，当前仍以统一订单做示意性聚合。"),
            capability("PROMOTION_TRIAL", "优惠试算", true, "scaffold", "订单级", "固定优先级试算已接线，可展示命中规则、互斥来源和恢复策略。")
        );
    }

    private static YyMarketingCapabilityVo capability(
        String code,
        String name,
        boolean enabled,
        String status,
        String scope,
        String gateCopy
    ) {
        YyMarketingCapabilityVo capability = new YyMarketingCapabilityVo();
        capability.setCapabilityCode(code);
        capability.setCapabilityName(name);
        capability.setEnabled(enabled);
        capability.setStatus(status);
        capability.setScopeLabel(scope);
        capability.setGateCopy(gateCopy);
        return capability;
    }
}
