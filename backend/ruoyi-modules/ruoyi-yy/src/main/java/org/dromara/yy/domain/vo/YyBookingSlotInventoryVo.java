package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyBookingSlotInventory;

import java.io.Serial;
import java.io.Serializable;

/**
 * 影约云统一预约时段库存视图对象 yy_booking_slot_inventory
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyBookingSlotInventory.class)
public class YyBookingSlotInventoryVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;

    @ExcelProperty(value = "门店ID")
    private Long storeId;

    @ExcelProperty(value = "服务组ID")
    private Long serviceGroupId;

    @ExcelProperty(value = "外部SKU ID")
    private String externalSkuId;

    @ExcelProperty(value = "日期")
    private String bizDate;

    @ExcelProperty(value = "开始时间")
    private String startTime;

    @ExcelProperty(value = "结束时间")
    private String endTime;

    @ExcelProperty(value = "容量")
    private Integer capacity;

    @ExcelProperty(value = "已确认")
    private Integer paidCount;

    @ExcelProperty(value = "库存冲突")
    private Integer conflictCount;

    @ExcelProperty(value = "状态")
    private String status;

    private String remark;
}
