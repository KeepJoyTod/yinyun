package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.RequiredArgsConstructor;
import org.dromara.yy.domain.YyProductBookingRule;
import org.dromara.yy.domain.YyProductChannelConfig;
import org.dromara.yy.domain.YyProductDisplayConfig;
import org.dromara.yy.domain.YyProductFulfillmentRule;
import org.dromara.yy.domain.YyProductRelation;
import org.dromara.yy.domain.YyProductSku;
import org.dromara.yy.domain.vo.YyProductBookingRuleVo;
import org.dromara.yy.domain.vo.YyProductCatalogVo;
import org.dromara.yy.domain.vo.YyProductChannelConfigVo;
import org.dromara.yy.domain.vo.YyProductDisplayConfigVo;
import org.dromara.yy.domain.vo.YyProductFulfillmentRuleVo;
import org.dromara.yy.domain.vo.YyProductRelationVo;
import org.dromara.yy.domain.vo.YyProductSkuVo;
import org.dromara.yy.domain.vo.YyProductVo;
import org.dromara.yy.mapper.YyProductBookingRuleMapper;
import org.dromara.yy.mapper.YyProductChannelConfigMapper;
import org.dromara.yy.mapper.YyProductDisplayConfigMapper;
import org.dromara.yy.mapper.YyProductFulfillmentRuleMapper;
import org.dromara.yy.mapper.YyProductMapper;
import org.dromara.yy.mapper.YyProductRelationMapper;
import org.dromara.yy.mapper.YyProductSkuMapper;
import org.dromara.yy.service.IYyProductBenefitBindingService;
import org.dromara.yy.service.IYyProductCatalogService;
import org.dromara.yy.service.IYyProductInventoryBindingService;
import org.dromara.yy.service.IYyProductOrderReadinessService;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class YyProductCatalogServiceImpl implements IYyProductCatalogService {
    private final YyProductMapper productMapper;
    private final YyProductSkuMapper skuMapper;
    private final YyProductDisplayConfigMapper displayConfigMapper;
    private final YyProductBookingRuleMapper bookingRuleMapper;
    private final YyProductRelationMapper relationMapper;
    private final YyProductChannelConfigMapper channelConfigMapper;
    private final YyProductFulfillmentRuleMapper fulfillmentRuleMapper;
    private final IYyProductOrderReadinessService orderReadinessService;
    private final IYyProductInventoryBindingService inventoryBindingService;
    private final IYyProductBenefitBindingService benefitBindingService;

    @Override
    public YyProductCatalogVo queryCatalogByProductId(Long productId) {
        YyProductVo product = productMapper.selectVoById(productId);
        if (product == null) {
            return null;
        }

        YyProductCatalogVo vo = new YyProductCatalogVo();
        vo.setProductId(product.getId());
        vo.setStoreId(product.getStoreId());
        vo.setProductType(product.getProductType());
        vo.setProductName(product.getProductName());
        vo.setPrice(product.getPrice());
        vo.setDurationMinutes(product.getDurationMinutes());
        vo.setStatus(product.getStatus());
        vo.setSort(product.getSort());
        vo.setSkus(listSkus(productId));
        vo.setDisplayConfig(firstDisplayConfig(productId));
        vo.setBookingRule(firstBookingRule(productId));
        vo.setRelations(listRelations(productId));
        vo.setChannelConfigs(listChannelConfigs(productId));
        vo.setFulfillmentRule(firstFulfillmentRule(productId));
        vo.setOrderReadiness(orderReadinessService.checkOrderReadiness(productId));
        vo.setInventoryBinding(inventoryBindingService.checkInventoryBinding(productId));
        vo.setBenefitBinding(benefitBindingService.checkBenefitBinding(productId));
        return vo;
    }

    private List<YyProductSkuVo> listSkus(Long productId) {
        return skuMapper.selectVoList(Wrappers.<YyProductSku>lambdaQuery()
            .eq(YyProductSku::getProductId, productId)
            .orderByAsc(YyProductSku::getSort)
            .orderByAsc(YyProductSku::getId));
    }

    private YyProductDisplayConfigVo firstDisplayConfig(Long productId) {
        return displayConfigMapper.selectVoList(Wrappers.<YyProductDisplayConfig>lambdaQuery()
                .eq(YyProductDisplayConfig::getProductId, productId)
                .orderByAsc(YyProductDisplayConfig::getId))
            .stream()
            .findFirst()
            .orElse(null);
    }

    private YyProductBookingRuleVo firstBookingRule(Long productId) {
        return bookingRuleMapper.selectVoList(Wrappers.<YyProductBookingRule>lambdaQuery()
                .eq(YyProductBookingRule::getProductId, productId)
                .orderByAsc(YyProductBookingRule::getId))
            .stream()
            .findFirst()
            .orElse(null);
    }

    private List<YyProductRelationVo> listRelations(Long productId) {
        return relationMapper.selectVoList(Wrappers.<YyProductRelation>lambdaQuery()
            .eq(YyProductRelation::getProductId, productId)
            .orderByAsc(YyProductRelation::getSort)
            .orderByAsc(YyProductRelation::getId));
    }

    private List<YyProductChannelConfigVo> listChannelConfigs(Long productId) {
        return channelConfigMapper.selectVoList(Wrappers.<YyProductChannelConfig>lambdaQuery()
            .eq(YyProductChannelConfig::getProductId, productId)
            .orderByAsc(YyProductChannelConfig::getId));
    }

    private YyProductFulfillmentRuleVo firstFulfillmentRule(Long productId) {
        return fulfillmentRuleMapper.selectVoList(Wrappers.<YyProductFulfillmentRule>lambdaQuery()
                .eq(YyProductFulfillmentRule::getProductId, productId)
                .orderByAsc(YyProductFulfillmentRule::getId))
            .stream()
            .findFirst()
            .orElse(null);
    }
}
