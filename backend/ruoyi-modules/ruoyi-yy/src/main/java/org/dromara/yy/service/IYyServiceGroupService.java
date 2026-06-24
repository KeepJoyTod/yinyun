package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyServiceGroupBo;
import org.dromara.yy.domain.vo.YyServiceGroupVo;

import java.util.Collection;
import java.util.List;

/**
 * 影约云服务组Service接口
 */
public interface IYyServiceGroupService {

    YyServiceGroupVo queryById(Long id);

    TableDataInfo<YyServiceGroupVo> queryPageList(YyServiceGroupBo bo, PageQuery pageQuery);

    List<YyServiceGroupVo> queryList(YyServiceGroupBo bo);

    Boolean insertByBo(YyServiceGroupBo bo);

    Boolean updateByBo(YyServiceGroupBo bo);

    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
