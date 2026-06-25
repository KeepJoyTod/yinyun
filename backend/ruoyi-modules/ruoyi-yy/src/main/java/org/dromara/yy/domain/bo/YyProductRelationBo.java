package org.dromara.yy.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.yy.domain.YyProductRelation;

@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyProductRelation.class, reverseConvertGenerate = false)
public class YyProductRelationBo extends BaseEntity {
    @NotNull(message = "主键不能为空", groups = { EditGroup.class })
    private Long id;
    @NotNull(message = "产品ID不能为空", groups = { AddGroup.class, EditGroup.class })
    private Long productId;
    @NotNull(message = "关联产品ID不能为空", groups = { AddGroup.class, EditGroup.class })
    private Long targetProductId;
    @NotBlank(message = "关联类型不能为空", groups = { AddGroup.class, EditGroup.class })
    private String relationType;
    private String pricePolicy;
    private Integer sort;
    private String status;
    private String remark;
}
