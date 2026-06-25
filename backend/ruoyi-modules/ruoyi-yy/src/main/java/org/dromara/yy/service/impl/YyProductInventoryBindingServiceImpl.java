package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.RequiredArgsConstructor;
import org.dromara.yy.domain.YyProductBookingRule;
import org.dromara.yy.domain.vo.YyProductInventoryBindingVo;
import org.dromara.yy.mapper.YyProductBookingRuleMapper;
import org.dromara.yy.service.IYyProductInventoryBindingService;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class YyProductInventoryBindingServiceImpl implements IYyProductInventoryBindingService {
    private final YyProductBookingRuleMapper bookingRuleMapper;

    @Override
    public YyProductInventoryBindingVo checkInventoryBinding(Long productId) {
        YyProductInventoryBindingVo vo = new YyProductInventoryBindingVo();
        vo.setProductId(productId);
        String status = bookingRuleMapper.selectVoList(Wrappers.<YyProductBookingRule>lambdaQuery()
                .eq(YyProductBookingRule::getProductId, productId)
                .orderByAsc(YyProductBookingRule::getId))
            .stream()
            .map(rule -> rule.getInventoryBindingStatus())
            .filter(value -> value != null && !value.isBlank())
            .findFirst()
            .orElse("UNBOUND");
        vo.setBindingStatus(status);
        vo.setBound("BOUND".equals(status));
        vo.setReason("Read-only binding status from product booking rule scaffold.");
        return vo;
    }
}
