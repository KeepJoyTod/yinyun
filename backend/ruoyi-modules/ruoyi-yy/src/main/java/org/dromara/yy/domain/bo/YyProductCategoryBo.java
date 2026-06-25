package org.dromara.yy.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.yy.domain.YyProductCategory;

@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyProductCategory.class, reverseConvertGenerate = false)
public class YyProductCategoryBo extends BaseEntity {
    @NotNull(message = "主键不能为空", groups = { EditGroup.class })
    private Long id;
    private Long storeId;
    private String categoryCode;
    @NotBlank(message = "分类名称不能为空", groups = { AddGroup.class, EditGroup.class })
    private String categoryName;
    private Long parentId;
    private Integer sort;
    private String status;
    private String remark;
}
