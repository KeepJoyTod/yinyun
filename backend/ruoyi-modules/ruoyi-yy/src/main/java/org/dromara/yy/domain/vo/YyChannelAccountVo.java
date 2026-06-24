package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import cn.idev.excel.annotation.format.DateTimeFormat;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyChannelAccount;
import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 影约云渠道授权账号视图对象 yy_channel_account
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyChannelAccount.class)
public class YyChannelAccountVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @ExcelProperty(value = "主键")
    private Long id;

    /**
     * 租户编号
     */
    private String tenantId;

    @ExcelProperty(value = "门店ID")
    /**
     * 门店ID
     */
    private Long storeId;

    @ExcelProperty(value = "渠道类型")
    /**
     * 渠道类型
     */
    private String channelType;

    @ExcelProperty(value = "授权账号")
    /**
     * 授权账号
     */
    private String accountName;

    @ExcelProperty(value = "应用Key")
    /**
     * 应用Key
     */
    private String appKey;

    /**
     * 加密应用密钥
     */
    private String appSecretEnc;

    @ExcelProperty(value = "服务ID")
    /**
     * 服务ID
     */
    private String serviceId;

    @ExcelProperty(value = "服务模式ID")
    /**
     * 服务模式ID
     */
    private String serviceModeId;

    @ExcelProperty(value = "服务市场应用ID")
    /**
     * 服务市场应用ID
     */
    private String serviceMarketAppId;

    @ExcelProperty(value = "服务市场跳转路径")
    /**
     * 服务市场跳转路径
     */
    private String serviceMarketPath;

    @ExcelProperty(value = "测试用户OpenID")
    /**
     * 测试用户OpenID
     */
    private String testOpenId;

    @ExcelProperty(value = "Webhook回调地址")
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
    @DateTimeFormat("yyyy-MM-dd HH:mm:ss")
    @ExcelProperty(value = "过期时间")
    /**
     * 过期时间
     */
    private Date expiresAt;

    @ExcelProperty(value = "授权状态")
    /**
     * 授权状态
     */
    private String status;

    @ExcelProperty(value = "备注")
    /**
     * 备注
     */
    private String remark;

    /**
     * 创建时间
     */
    @ExcelProperty(value = "创建时间")
    private Date createTime;

    /**
     * 更新时间
     */
    @ExcelProperty(value = "更新时间")
    private Date updateTime;
}
