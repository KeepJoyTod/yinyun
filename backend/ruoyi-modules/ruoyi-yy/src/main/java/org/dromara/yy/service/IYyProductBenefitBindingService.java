package org.dromara.yy.service;

import org.dromara.yy.domain.vo.YyProductBenefitBindingVo;

public interface IYyProductBenefitBindingService {
    YyProductBenefitBindingVo checkBenefitBinding(Long productId);
}
