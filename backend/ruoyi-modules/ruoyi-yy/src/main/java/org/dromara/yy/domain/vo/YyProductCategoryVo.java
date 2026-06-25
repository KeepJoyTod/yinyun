package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyProductCategory;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyProductCategory.class)
public class YyProductCategoryVo implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private String tenantId;
    private Long storeId;
    private String categoryCode;
    private String categoryName;
    private Long parentId;
    private Integer sort;
    private String status;
    private String remark;
    private Date createTime;
    private Date updateTime;
}
