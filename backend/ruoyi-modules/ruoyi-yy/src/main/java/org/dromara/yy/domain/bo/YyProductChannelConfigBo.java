package org.dromara.yy.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.yy.domain.YyProductChannelConfig;

@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyProductChannelConfig.class, reverseConvertGenerate = false)
public class YyProductChannelConfigBo extends BaseEntity {
    @NotNull(message = "主键不能为空", groups = { EditGroup.class })
    private Long id;
    @NotNull(message = "产品ID不能为空", groups = { AddGroup.class, EditGroup.class })
    private Long productId;
    private Long channelMappingId;
    @NotBlank(message = "渠道类型不能为空", groups = { AddGroup.class, EditGroup.class })
    private String channelType;
    private String externalProductId;
    private String externalSkuId;
    private String externalPoiId;
    private String landingUrl;
    private String landingPath;
    private String mappingStatus;
    private String status;
    private String remark;
}
