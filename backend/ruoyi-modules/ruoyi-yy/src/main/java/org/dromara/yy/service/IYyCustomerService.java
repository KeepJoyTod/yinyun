package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyCustomerBo;
import org.dromara.yy.domain.vo.YyCustomerVo;
import org.dromara.yy.domain.vo.YyOrderVo;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

/**
 * 影约云客户Service接口
 */
public interface IYyCustomerService {

    YyCustomerVo queryById(Long id);

    TableDataInfo<YyCustomerVo> queryPageList(YyCustomerBo bo, PageQuery pageQuery);

    List<YyCustomerVo> queryList(YyCustomerBo bo);

    Boolean insertByBo(YyCustomerBo bo);

    Boolean updateByBo(YyCustomerBo bo);

    Boolean deleteWithValidByIds(java.util.Collection<Long> ids, Boolean isValid);

    Long upsertByMobile(String customerName, String mobile, String source, BigDecimal spend, Date orderTime, String remark);

    List<YyOrderVo> queryRecentOrdersByCustomerId(Long customerId, int limit);
}
