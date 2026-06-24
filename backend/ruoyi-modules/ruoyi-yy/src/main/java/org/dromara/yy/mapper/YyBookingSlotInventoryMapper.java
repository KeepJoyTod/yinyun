package org.dromara.yy.mapper;

import org.apache.ibatis.annotations.Param;
import org.dromara.common.mybatis.core.mapper.BaseMapperPlus;
import org.dromara.yy.domain.YyBookingSlotInventory;
import org.dromara.yy.domain.vo.YyBookingSlotInventoryVo;

/**
 * 影约云统一预约时段库存Mapper接口
 */
public interface YyBookingSlotInventoryMapper extends BaseMapperPlus<YyBookingSlotInventory, YyBookingSlotInventoryVo> {

    /**
     * 仅在剩余容量大于 0 时确认一笔已支付预约。
     */
    int incrementPaidCountIfAvailable(@Param("id") Long id);

    /**
     * 释放一笔已确认预约容量。
     */
    int decrementPaidCount(@Param("id") Long id);

    /**
     * 记录已支付但容量不足的冲突单。
     */
    int incrementConflictCount(@Param("id") Long id);
}
