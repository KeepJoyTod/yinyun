package org.dromara.yy.service;

import org.dromara.yy.domain.vo.YyProductCatalogVo;

public interface IYyProductCatalogService {
    YyProductCatalogVo queryCatalogByProductId(Long productId);
}
