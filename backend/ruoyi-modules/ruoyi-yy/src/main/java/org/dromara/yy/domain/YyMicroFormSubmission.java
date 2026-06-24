package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;
import org.dromara.yy.handler.JsonbStringTypeHandler;

import java.io.Serial;
import java.util.Date;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName(value = "yy_merchant_micro_form_submission", autoResultMap = true)
public class YyMicroFormSubmission extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id")
    private Long id;

    private Long formId;

    private String formNameSnapshot;

    private String customerName;

    private String customerPhone;

    @TableField(typeHandler = JsonbStringTypeHandler.class)
    private String answersJson;

    private Date submittedAt;

    private String followStatus;

    private String followRemark;

    private Long orderId;

    private String remark;

    @TableLogic
    private String delFlag;
}
