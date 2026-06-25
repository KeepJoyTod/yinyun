package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyProductRelationBo;
import org.dromara.yy.domain.vo.YyProductRelationVo;

import java.util.Collection;
import java.util.List;

public interface IYyProductRelationService {
    YyProductRelationVo queryById(Long id);

    TableDataInfo<YyProductRelationVo> queryPageList(YyProductRelationBo bo, PageQuery pageQuery);

    List<YyProductRelationVo> queryList(YyProductRelationBo bo);

    Boolean insertByBo(YyProductRelationBo bo);

    Boolean updateByBo(YyProductRelationBo bo);

    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
