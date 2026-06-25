package org.dromara.yy.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.yy.domain.YyCouponTemplate;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyCouponTemplate.class, reverseConvertGenerate = false)
public class YyCouponTemplateBo extends BaseEntity {

    @NotNull(message = "券模板ID不能为空", groups = { EditGroup.class })
    private Long id;

    private Long storeId;

    @NotBlank(message = "券模板名称不能为空", groups = { AddGroup.class, EditGroup.class })
    private String templateName;

    @NotBlank(message = "券模板类型不能为空", groups = { AddGroup.class, EditGroup.class })
    private String templateType;

    private String status;

    private Long queryStoreId;

    @NotEmpty(message = "适用门店不能为空", groups = { AddGroup.class, EditGroup.class })
    private List<Long> storeIds;

    @NotEmpty(message = "适用商品不能为空", groups = { AddGroup.class, EditGroup.class })
    private List<Long> productIds;

    private Long faceValueCent;

    private Long minSpendCent;

    private String stackPolicy;

    private Boolean restoreOnRefund;

    private String startAt;

    private String endAt;
}
