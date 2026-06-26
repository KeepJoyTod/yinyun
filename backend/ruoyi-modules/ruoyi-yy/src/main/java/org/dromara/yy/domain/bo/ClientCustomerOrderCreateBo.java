package org.dromara.yy.domain.bo;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Map;

/**
 * 客户端自助预约下单请求。
 */
@Data
public class ClientCustomerOrderCreateBo {

    @NotBlank(message = "门店不能为空")
    private String storeId;

    @NotBlank(message = "商品规格不能为空")
    private String skuId;

    private String categoryId;

    private String serviceGroupId;

    @NotBlank(message = "客户姓名不能为空")
    private String customerName;

    @NotBlank(message = "客户手机号不能为空")
    private String customerPhone;

    private String remark;

    private Map<String, String> customFields;

    private String entitlementCandidateId;

    private String entitlementKind;

    private String entitlementUnavailableReason;

    @NotBlank(message = "预约日期不能为空")
    private String appointmentDate;

    @NotBlank(message = "预约时段不能为空")
    private String timeSlot;
}
