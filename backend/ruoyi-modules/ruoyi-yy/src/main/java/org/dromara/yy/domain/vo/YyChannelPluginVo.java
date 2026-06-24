package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import cn.idev.excel.annotation.format.DateTimeFormat;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyChannelPlugin;
import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 影约云渠道插件视图对象 yy_channel_plugin
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyChannelPlugin.class)
public class YyChannelPluginVo implements Serializable {

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

    @ExcelProperty(value = "渠道类型")
    /**
     * 渠道类型
     */
    private String channelType;

    @ExcelProperty(value = "插件名称")
    /**
     * 插件名称
     */
    private String pluginName;

    @ExcelProperty(value = "是否启用")
    /**
     * 是否启用
     */
    private String enabled;

    @ExcelProperty(value = "授权状态")
    /**
     * 授权状态
     */
    private String authStatus;

    @ExcelProperty(value = "未开通提示")
    /**
     * 未开通提示
     */
    private String openTip;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat("yyyy-MM-dd HH:mm:ss")
    @ExcelProperty(value = "最后同步时间")
    /**
     * 最后同步时间
     */
    private Date lastSyncTime;

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
