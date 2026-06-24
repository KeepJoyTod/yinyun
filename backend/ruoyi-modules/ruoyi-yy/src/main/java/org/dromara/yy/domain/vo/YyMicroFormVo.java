package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyMicroForm;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyMicroForm.class)
public class YyMicroFormVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @ExcelProperty(value = "ID")
    private Long id;

    private String tenantId;

    @ExcelProperty(value = "Store ID")
    private Long storeId;

    @ExcelProperty(value = "Form Name")
    private String formName;

    @ExcelProperty(value = "Status")
    private String status;

    private String schemaJson;

    @ExcelProperty(value = "Notify Users")
    private String notifyUsers;

    @ExcelProperty(value = "Published At")
    private Date publishedAt;

    @ExcelProperty(value = "Link Key")
    private String linkKey;

    @ExcelProperty(value = "Submission Count")
    private Long submissionCount;

    @ExcelProperty(value = "Remark")
    private String remark;

    @ExcelProperty(value = "Created At")
    private Date createTime;

    @ExcelProperty(value = "Updated At")
    private Date updateTime;
}
