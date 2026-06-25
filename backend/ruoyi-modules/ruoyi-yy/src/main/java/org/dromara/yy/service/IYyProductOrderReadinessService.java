package org.dromara.yy.service;

import org.dromara.yy.domain.vo.YyProductOrderReadinessVo;

public interface IYyProductOrderReadinessService {
    YyProductOrderReadinessVo checkOrderReadiness(Long productId);
}
