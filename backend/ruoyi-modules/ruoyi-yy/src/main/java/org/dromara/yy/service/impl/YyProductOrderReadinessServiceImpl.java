package org.dromara.yy.service.impl;

import lombok.RequiredArgsConstructor;
import org.dromara.yy.domain.vo.YyProductOrderReadinessVo;
import org.dromara.yy.mapper.YyProductMapper;
import org.dromara.yy.service.IYyProductOrderReadinessService;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class YyProductOrderReadinessServiceImpl implements IYyProductOrderReadinessService {
    private final YyProductMapper productMapper;

    @Override
    public YyProductOrderReadinessVo checkOrderReadiness(Long productId) {
        YyProductOrderReadinessVo vo = new YyProductOrderReadinessVo();
        vo.setProductId(productId);
        boolean exists = productId != null && productMapper.selectById(productId) != null;
        vo.setReady(exists);
        vo.setStatus(exists ? "READY_FOR_CONFIG" : "PRODUCT_NOT_FOUND");
        vo.setReason(exists ? "Product exists; order integration requires later acceptance." : "Product does not exist.");
        return vo;
    }
}
