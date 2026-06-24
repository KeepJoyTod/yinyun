package org.dromara.yy.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.yy.domain.YyMerchantDecoration;

@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyMerchantDecoration.class, reverseConvertGenerate = false)
public class YyMerchantDecorationBo extends BaseEntity {

    private Long id;

    private Long storeId;

    private String channelType;

    private String status;

    @NotBlank(message = "configJson is required")
    private String configJson;

    private Long shareIconOssId;

    private Long watermarkOssId;

    private String previewToken;

    private String remark;
}
