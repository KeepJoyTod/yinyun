package org.dromara.yy.domain.bo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.util.Date;

/**
 * 工作台复制订单请求。
 */
@Data
public class YyOrderCopyBo {

    /**
     * 复制后的档期模式：REUSE_SLOT / UNDECIDED。
     */
    private String scheduleMode;

    /**
     * 复制后的到店时间。
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date arrivalTime;

    /**
     * 复制后的预约日期 yyyy-MM-dd。
     */
    private String slotDate;

    /**
     * 复制后的预约开始时间 HH:mm。
     */
    private String slotStartTime;

    /**
     * 复制后的预约结束时间 HH:mm。
     */
    private String slotEndTime;

    /**
     * 本次复制备注。
     */
    private String remark;
}
