package org.dromara.yy.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.yy.domain.YyBookingSlotInventory;

/**
 * 影约云统一预约时段库存业务对象 yy_booking_slot_inventory
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyBookingSlotInventory.class, reverseConvertGenerate = false)
public class YyBookingSlotInventoryBo extends BaseEntity {

    /**
     * 主键
     */
    @NotNull(message = "库存时段不能为空", groups = { EditGroup.class })
    private Long id;

    /**
     * 门店ID
     */
    private Long storeId;

    /**
     * 服务组ID
     */
    private Long serviceGroupId;

    /**
     * 外部SKU ID
     */
    private String externalSkuId;

    /**
     * 业务日期 yyyy-MM-dd
     */
    private String bizDate;

    /**
     * 查询开始日期 yyyy-MM-dd
     */
    private String beginBizDate;

    /**
     * 查询结束日期 yyyy-MM-dd
     */
    private String endBizDate;

    /**
     * 开始时间 HH:mm
     */
    private String startTime;

    /**
     * 结束时间 HH:mm
     */
    private String endTime;

    /**
     * 可预约容量
     */
    @Min(value = 0, message = "容量不能小于0", groups = { EditGroup.class })
    private Integer capacity;

    /**
     * 状态
     */
    private String status;

    /**
     * 只看冲突时段：1 是
     */
    private String conflictOnly;

    /**
     * 备注
     */
    private String remark;
}
