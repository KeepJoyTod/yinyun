package org.dromara.yy.domain.bo;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.yy.domain.YyChannelAccount;
import java.util.Date;

/**
 * 影约云渠道授权账号业务对象 yy_channel_account
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyChannelAccount.class, reverseConvertGenerate = false)
public class YyChannelAccountBo extends BaseEntity {

    /**
     * 主键
     */
    @NotNull(message = "主键不能为空", groups = { EditGroup.class })
    private Long id;

    /**
     * 门店ID
     */
    private Long storeId;

    @NotBlank(message = "渠道类型不能为空", groups = { AddGroup.class, EditGroup.class })
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
    private String accessTokenEnc;

    /**
     * 加密刷新令牌
     */
    private String refreshTokenEnc;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
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
}
