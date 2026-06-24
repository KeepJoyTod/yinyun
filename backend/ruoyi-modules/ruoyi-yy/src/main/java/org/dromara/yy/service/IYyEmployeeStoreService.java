package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyEmployeeStoreBo;
import org.dromara.yy.domain.vo.YyEmployeeStoreVo;

import java.util.Collection;
import java.util.List;

/**
 * 影约云员工-门店关联Service接口
 */
public interface IYyEmployeeStoreService {

    YyEmployeeStoreVo queryById(Long id);

    TableDataInfo<YyEmployeeStoreVo> queryPageList(YyEmployeeStoreBo bo, PageQuery pageQuery);

    List<YyEmployeeStoreVo> queryList(YyEmployeeStoreBo bo);

    Boolean insertByBo(YyEmployeeStoreBo bo);

    Boolean updateByBo(YyEmployeeStoreBo bo);

    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);

    List<YyEmployeeStoreVo> listStoreScopes(Long employeeId);
}
