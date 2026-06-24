package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.encrypt.annotation.EncryptField;
import org.dromara.common.tenant.core.TenantEntity;
import java.io.Serial;
import java.util.Date;

/**
 * 影约云渠道授权账号对象 yy_channel_account
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_channel_account")
public class YyChannelAccount extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @TableId(value = "id")
    private Long id;

    /**
     * 门店ID
     */
    private Long storeId;

    /**
     * 渠道类型
     */
    private String channelType;

    /**
     * 授权账号
     */
    private String accountName;

    /**
     * 应用Key
     */
    private String appKey;

    /**
     * 加密应用密钥
     */
    @EncryptField
    private String appSecretEnc;

    /**
     * 服务ID
     */
    private String serviceId;

    /**
     * 服务模式ID
     */
    private String serviceModeId;

    /**
     * 服务市场应用ID
     */
    private String serviceMarketAppId;

    /**
     * 服务市场跳转路径
     */
    private String serviceMarketPath;

    /**
     * 测试用户OpenID
     */
    private String testOpenId;

    /**
     * Webhook回调地址
     */
    private String webhookUrl;

    /**
     * 加密访问令牌
     */
    @EncryptField
    private String accessTokenEnc;

    /**
     * 加密刷新令牌
     */
    @EncryptField
    private String refreshTokenEnc;

    /**
     * 过期时间
     */
    private Date expiresAt;

    /**
     * 授权状态
     */
    private String status;

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
