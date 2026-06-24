package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyChannelSyncLog;
import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 影约云渠道同步日志视图对象 yy_channel_sync_log
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyChannelSyncLog.class)
public class YyChannelSyncLogVo implements Serializable {

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

    @ExcelProperty(value = "接口名")
    /**
     * 接口名
     */
    private String apiName;

    @ExcelProperty(value = "请求ID")
    /**
     * 请求ID
     */
    private String requestId;

    @ExcelProperty(value = "是否成功")
    /**
     * 是否成功
     */
    private String success;

    @ExcelProperty(value = "错误信息")
    /**
     * 错误信息
     */
    private String errorMessage;

    @ExcelProperty(value = "耗时毫秒")
    /**
     * 耗时毫秒
     */
    private Long durationMs;

    @ExcelProperty(value = "是否可重试")
    /**
     * 是否可重试
     */
    private String retryable;

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
