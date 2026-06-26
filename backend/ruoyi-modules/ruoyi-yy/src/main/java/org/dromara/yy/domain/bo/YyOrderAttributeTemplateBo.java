package org.dromara.yy.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.yy.domain.YyOrderAttributeTemplate;

/**
 * 订单属性模板业务对象 yy_order_attribute_template
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyOrderAttributeTemplate.class, reverseConvertGenerate = false)
public class YyOrderAttributeTemplateBo extends BaseEntity {

    @NotNull(message = "主键不能为空", groups = { EditGroup.class })
    private Long id;

    @NotNull(message = "门店ID不能为空", groups = { AddGroup.class, EditGroup.class })
    private Long storeId;

    @NotBlank(message = "字段编码不能为空", groups = { AddGroup.class, EditGroup.class })
    private String fieldCode;

    @NotBlank(message = "字段名称不能为空", groups = { AddGroup.class, EditGroup.class })
    private String fieldLabel;

    @NotBlank(message = "字段类型不能为空", groups = { AddGroup.class, EditGroup.class })
    private String fieldType;

    private String required;

    private String optionsJson;

    private Integer sort;

    private String status;

    private String remark;
}
