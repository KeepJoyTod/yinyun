package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.RequiredArgsConstructor;
import org.dromara.yy.domain.YyProductBookingRule;
import org.dromara.yy.domain.vo.YyProductBenefitBindingVo;
import org.dromara.yy.mapper.YyProductBookingRuleMapper;
import org.dromara.yy.service.IYyProductBenefitBindingService;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class YyProductBenefitBindingServiceImpl implements IYyProductBenefitBindingService {
    private final YyProductBookingRuleMapper bookingRuleMapper;

    @Override
    public YyProductBenefitBindingVo checkBenefitBinding(Long productId) {
        YyProductBenefitBindingVo vo = new YyProductBenefitBindingVo();
        vo.setProductId(productId);
        String status = bookingRuleMapper.selectVoList(Wrappers.<YyProductBookingRule>lambdaQuery()
                .eq(YyProductBookingRule::getProductId, productId)
                .orderByAsc(YyProductBookingRule::getId))
            .stream()
            .map(rule -> rule.getBenefitBindingStatus())
            .filter(value -> value != null && !value.isBlank())
            .findFirst()
            .orElse("UNBOUND");
        vo.setBindingStatus(status);
        vo.setBound("BOUND".equals(status));
        vo.setReason("Read-only benefit status from product booking rule scaffold.");
        return vo;
    }
}
