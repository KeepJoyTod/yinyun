package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;

import java.io.Serial;

/**
 * 影约云统一预约时段库存对象 yy_booking_slot_inventory
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_booking_slot_inventory")
public class YyBookingSlotInventory extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id")
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
     * 外部SKU ID，供抖音来客等渠道库存映射使用。
     */
    private String externalSkuId;

    /**
     * 业务日期 yyyy-MM-dd
     */
    private String bizDate;

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
    private Integer capacity;

    /**
     * 已支付确认数量
     */
    private Integer paidCount;

    /**
     * 已支付但库存冲突数量
     */
    private Integer conflictCount;

    /**
     * 状态
     */
    private String status;

    /**
     * 乐观版本
     */
    private Integer version;

    /**
     * 备注
     */
    private String remark;

    /**
     * 删除标志
     */
    @TableLogic
    private String delFlag;
}
