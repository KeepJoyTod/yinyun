package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.encrypt.annotation.EncryptField;
import org.dromara.common.tenant.core.TenantEntity;

import java.io.Serial;

/**
 * 多端预约入口配置对象 yy_mobile_channel_config
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_mobile_channel_config")
public class YyMobileChannelConfig extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @TableId(value = "id")
    private Long id;

    /**
     * 端类型
     */
    private String channelType;

    /**
     * 端名称
     */
    private String channelName;

    /**
     * 应用ID
     */
    private String appId;

    /**
     * 加密应用密钥
     */
    @EncryptField
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

    /**
     * 删除标志
     */
    @TableLogic
    private String delFlag;
}
