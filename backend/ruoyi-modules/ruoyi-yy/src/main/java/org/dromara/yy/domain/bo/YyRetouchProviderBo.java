package org.dromara.yy.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.yy.domain.YyRetouchProvider;

/**
 * 三方修图服务商业务对象。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyRetouchProvider.class, reverseConvertGenerate = false)
public class YyRetouchProviderBo extends BaseEntity {

    @NotNull(message = "主键不能为空", groups = { EditGroup.class })
    private Long id;

    @NotBlank(message = "服务商编码不能为空", groups = { AddGroup.class, EditGroup.class })
    private String providerCode;

    @NotBlank(message = "服务商名称不能为空", groups = { AddGroup.class, EditGroup.class })
    private String providerName;

    private String contactName;

    private String contactPhone;

    private String supportedStoreIds;

    private String serviceScope;

    private String quoteMode;

    private String settlementMode;

    private String applicationStatus;

    private String status;

    private Integer ratingScore;

    private Integer slaHours;

    private String remark;
}
