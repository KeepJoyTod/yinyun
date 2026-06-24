package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyEmployeeBo;
import org.dromara.yy.domain.vo.YyEmployeeVo;

import java.util.Collection;
import java.util.List;

/**
 * 影约云员工Service接口
 */
public interface IYyEmployeeService {

    YyEmployeeVo queryById(Long id);

    TableDataInfo<YyEmployeeVo> queryPageList(YyEmployeeBo bo, PageQuery pageQuery);

    List<YyEmployeeVo> queryList(YyEmployeeBo bo);

    Boolean insertByBo(YyEmployeeBo bo);

    Boolean updateByBo(YyEmployeeBo bo);

    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
