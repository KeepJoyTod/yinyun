package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyWorkOrderBo;
import org.dromara.yy.domain.vo.YyWorkOrderEventVo;
import org.dromara.yy.domain.vo.YyWorkOrderVo;

import java.util.Collection;
import java.util.List;

/**
 * 工单Service接口
 */
public interface IYyWorkOrderService {

    TableDataInfo<YyWorkOrderVo> queryPageList(YyWorkOrderBo bo, PageQuery pageQuery);

    YyWorkOrderVo queryById(Long id);

    List<YyWorkOrderVo> queryList(YyWorkOrderBo bo);

    List<YyWorkOrderEventVo> queryEventList(Long workOrderId);

    Boolean insertByBo(YyWorkOrderBo bo);

    Boolean updateByBo(YyWorkOrderBo bo);

    YyWorkOrderVo transitionStatus(Long id, String expectedStatus, String targetStatus, String remark);

    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
