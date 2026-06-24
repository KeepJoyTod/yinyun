package org.dromara.yy.domain.bo;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Date;

/**
 * 店员工作台新增预约请求。
 */
@Data
public class YyStaffBookingCreateBo {

    @NotNull(message = "门店ID不能为空")
    private Long storeId;

    @NotNull(message = "服务组ID不能为空")
    private Long serviceGroupId;

    @NotBlank(message = "客户姓名不能为空")
    private String customerName;

    @NotBlank(message = "客户手机号不能为空")
    private String customerPhone;

    private Long productId;

    private Long customerId;

    private String gender;

    private String email;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date arrivalTime;

    private String slotDate;

    private String slotStartTime;

    private String slotEndTime;

    private String scheduleMode;

    private Boolean notifyEnabled;

    private String submitMode;

    private String status;

    private String payStatus;

    private String workstationNo;

    private String remark;
}
