package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyProductCategoryBo;
import org.dromara.yy.domain.vo.YyProductCategoryVo;

import java.util.Collection;
import java.util.List;

public interface IYyProductCategoryService {
    YyProductCategoryVo queryById(Long id);

    TableDataInfo<YyProductCategoryVo> queryPageList(YyProductCategoryBo bo, PageQuery pageQuery);

    List<YyProductCategoryVo> queryList(YyProductCategoryBo bo);

    Boolean insertByBo(YyProductCategoryBo bo);

    Boolean updateByBo(YyProductCategoryBo bo);

    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
