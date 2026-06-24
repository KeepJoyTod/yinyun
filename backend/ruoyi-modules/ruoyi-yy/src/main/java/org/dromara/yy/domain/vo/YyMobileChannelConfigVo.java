package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyMobileChannelConfig;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 多端预约入口配置视图对象 yy_mobile_channel_config
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyMobileChannelConfig.class)
public class YyMobileChannelConfigVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @ExcelProperty(value = "主键")
    private Long id;

    /**
     * 租户编号
     */
    private String tenantId;

    @ExcelProperty(value = "端类型")
    private String channelType;

    @ExcelProperty(value = "端名称")
    private String channelName;

    @ExcelProperty(value = "应用ID")
    private String appId;

    /**
     * 加密应用密钥，接口返回时只显示掩码。
     */
    private String appSecretEnc;

    @ExcelProperty(value = "回调地址")
    private String callbackUrl;

    @ExcelProperty(value = "是否启用")
    private String enabled;

    @ExcelProperty(value = "SDK状态")
    private String sdkStatus;

    @ExcelProperty(value = "备注")
    private String remark;

    @ExcelProperty(value = "创建时间")
    private Date createTime;

    @ExcelProperty(value = "更新时间")
    private Date updateTime;
}
