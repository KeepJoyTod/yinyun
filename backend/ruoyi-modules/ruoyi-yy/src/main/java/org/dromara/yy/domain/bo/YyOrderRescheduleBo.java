package org.dromara.yy.domain.bo;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Date;

/**
 * 工作台订单改期请求。
 */
@Data
public class YyOrderRescheduleBo {

    /**
     * 前端看到的当前状态，用于防止并发覆盖。
     */
    @NotBlank(message = "当前状态不能为空")
    private String expectedStatus;

    /**
     * 新到店时间。
     */
    @NotNull(message = "到店时间不能为空")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date arrivalTime;

    /**
     * 服务组ID。
     */
    private Long serviceGroupId;

    /**
     * 预约日期 yyyy-MM-dd。
     */
    private String slotDate;

    /**
     * 预约开始时间 HH:mm。
     */
    private String slotStartTime;

    /**
     * 预约结束时间 HH:mm。
     */
    private String slotEndTime;

    /**
     * 操作备注。
     */
    private String remark;
}
