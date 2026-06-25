package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyProductSkuBo;
import org.dromara.yy.domain.vo.YyProductSkuVo;

import java.util.Collection;
import java.util.List;

public interface IYyProductSkuService {
    YyProductSkuVo queryById(Long id);

    TableDataInfo<YyProductSkuVo> queryPageList(YyProductSkuBo bo, PageQuery pageQuery);

    List<YyProductSkuVo> queryList(YyProductSkuBo bo);

    Boolean insertByBo(YyProductSkuBo bo);

    Boolean updateByBo(YyProductSkuBo bo);

    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
