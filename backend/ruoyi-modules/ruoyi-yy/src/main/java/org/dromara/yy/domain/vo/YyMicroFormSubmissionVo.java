package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyMicroFormSubmission;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyMicroFormSubmission.class)
public class YyMicroFormSubmissionVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @ExcelProperty(value = "ID")
    private Long id;

    private String tenantId;

    @ExcelProperty(value = "Form ID")
    private Long formId;

    @ExcelProperty(value = "Form Name")
    private String formNameSnapshot;

    @ExcelProperty(value = "Customer Name")
    private String customerName;

    @ExcelProperty(value = "Customer Phone")
    private String customerPhone;

    private String answersJson;

    @ExcelProperty(value = "Submitted At")
    private Date submittedAt;

    @ExcelProperty(value = "Follow Status")
    private String followStatus;

    @ExcelProperty(value = "Follow Remark")
    private String followRemark;

    @ExcelProperty(value = "Order ID")
    private Long orderId;

    @ExcelProperty(value = "Remark")
    private String remark;

    @ExcelProperty(value = "Created At")
    private Date createTime;

    @ExcelProperty(value = "Updated At")
    private Date updateTime;
}
