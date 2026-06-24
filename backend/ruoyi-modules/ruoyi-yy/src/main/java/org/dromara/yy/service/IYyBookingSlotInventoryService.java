package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.bo.YyBookingSlotInventoryBo;
import org.dromara.yy.domain.vo.BookingSlotInventoryDecision;
import org.dromara.yy.domain.vo.YyBookingSlotInventoryVo;

import java.util.List;

/**
 * 影约云统一预约时段库存Service接口
 */
public interface IYyBookingSlotInventoryService {

    YyBookingSlotInventoryVo queryById(Long id);

    TableDataInfo<YyBookingSlotInventoryVo> queryPageList(YyBookingSlotInventoryBo bo, PageQuery pageQuery);

    List<YyBookingSlotInventoryVo> queryList(YyBookingSlotInventoryBo bo);

    Boolean updateByBo(YyBookingSlotInventoryBo bo);

    /**
     * 支付成功后确认订单对应时段库存。
     */
    BookingSlotInventoryDecision confirmPaidOrderSlot(YyOrder order);

    /**
     * 释放已确认订单对应时段库存。
     */
    void releaseConfirmedOrderSlot(YyOrder order);
}
