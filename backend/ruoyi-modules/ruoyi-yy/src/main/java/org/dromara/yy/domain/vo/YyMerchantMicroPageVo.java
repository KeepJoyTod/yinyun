package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyMerchantMicroPage;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyMerchantMicroPage.class)
public class YyMerchantMicroPageVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @ExcelProperty(value = "ID")
    private Long id;

    private String tenantId;

    @ExcelProperty(value = "Store ID")
    private Long storeId;

    @ExcelProperty(value = "Page Title")
    private String pageTitle;

    @ExcelProperty(value = "Page Description")
    private String pageDesc;

    @ExcelProperty(value = "Cover Url")
    private String coverUrl;

    private Long coverOssId;

    @ExcelProperty(value = "Background Color")
    private String backgroundColor;

    @ExcelProperty(value = "Edit Mode")
    private String editMode;

    @ExcelProperty(value = "Status")
    private String status;

    private String configJson;

    private String publishedConfigJson;

    @ExcelProperty(value = "Published At")
    private Date publishedAt;

    @ExcelProperty(value = "Link Key")
    private String linkKey;

    @ExcelProperty(value = "Remark")
    private String remark;

    @ExcelProperty(value = "Created At")
    private Date createTime;

    @ExcelProperty(value = "Updated At")
    private Date updateTime;
}
