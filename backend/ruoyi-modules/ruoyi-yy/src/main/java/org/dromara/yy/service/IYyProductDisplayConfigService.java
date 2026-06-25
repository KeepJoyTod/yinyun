package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyProductDisplayConfigBo;
import org.dromara.yy.domain.vo.YyProductDisplayConfigVo;

import java.util.Collection;
import java.util.List;

public interface IYyProductDisplayConfigService {
    YyProductDisplayConfigVo queryById(Long id);

    TableDataInfo<YyProductDisplayConfigVo> queryPageList(YyProductDisplayConfigBo bo, PageQuery pageQuery);

    List<YyProductDisplayConfigVo> queryList(YyProductDisplayConfigBo bo);

    Boolean insertByBo(YyProductDisplayConfigBo bo);

    Boolean updateByBo(YyProductDisplayConfigBo bo);

    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
