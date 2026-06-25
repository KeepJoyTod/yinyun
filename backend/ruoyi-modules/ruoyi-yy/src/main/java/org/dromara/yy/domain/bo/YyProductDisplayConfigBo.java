package org.dromara.yy.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.yy.domain.YyProductDisplayConfig;

@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyProductDisplayConfig.class, reverseConvertGenerate = false)
public class YyProductDisplayConfigBo extends BaseEntity {
    @NotNull(message = "主键不能为空", groups = { EditGroup.class })
    private Long id;
    @NotNull(message = "产品ID不能为空", groups = { AddGroup.class, EditGroup.class })
    private Long productId;
    private String showPlatform;
    private String bookingButtonText;
    private String directUrl;
    private String qrScene;
    private String onlineBookingFlag;
    private String storeOrderFlag;
    private String detailButtonMode;
    private String status;
    private String remark;
}
