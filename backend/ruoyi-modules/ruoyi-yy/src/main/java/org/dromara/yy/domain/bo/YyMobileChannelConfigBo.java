package org.dromara.yy.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.yy.domain.YyMobileChannelConfig;

/**
 * 多端预约入口配置业务对象 yy_mobile_channel_config
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyMobileChannelConfig.class, reverseConvertGenerate = false)
public class YyMobileChannelConfigBo extends BaseEntity {

    /**
     * 主键
     */
    @NotNull(message = "主键不能为空", groups = { EditGroup.class })
    private Long id;

    /**
     * 端类型
     */
    @NotBlank(message = "端类型不能为空", groups = { AddGroup.class, EditGroup.class })
    private String channelType;

    /**
     * 端名称
     */
    @NotBlank(message = "端名称不能为空", groups = { AddGroup.class, EditGroup.class })
    private String channelName;

    /**
     * 应用ID
     */
    private String appId;

    /**
     * 加密应用密钥
     */
    private String appSecretEnc;

    /**
     * 回调地址
     */
    private String callbackUrl;

    /**
     * 是否启用
     */
    private String enabled;

    /**
     * SDK状态
     */
    private String sdkStatus;

    /**
     * 备注
     */
    private String remark;
}
