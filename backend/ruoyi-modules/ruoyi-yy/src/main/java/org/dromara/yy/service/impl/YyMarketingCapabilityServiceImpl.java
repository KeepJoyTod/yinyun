package org.dromara.yy.service.impl;

import lombok.RequiredArgsConstructor;
import org.dromara.yy.domain.vo.YyMarketingCapabilityVo;
import org.dromara.yy.service.IYyMarketingCapabilityService;
import org.dromara.yy.service.marketing.resolver.PromotionCapabilityResolver;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class YyMarketingCapabilityServiceImpl implements IYyMarketingCapabilityService {

    private final PromotionCapabilityResolver resolver = new PromotionCapabilityResolver();

    @Override
    public List<YyMarketingCapabilityVo> listCapabilities() {
        return resolver.resolveDefaults();
    }
}
