package org.dromara.yy.service;

import org.dromara.yy.domain.vo.YyProductInventoryBindingVo;

public interface IYyProductInventoryBindingService {
    YyProductInventoryBindingVo checkInventoryBinding(Long productId);
}
