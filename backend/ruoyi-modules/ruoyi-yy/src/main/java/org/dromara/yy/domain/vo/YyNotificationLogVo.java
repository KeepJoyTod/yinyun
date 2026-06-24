package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyNotificationLog;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 通知发送日志视图对象 yy_notification_log
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyNotificationLog.class)
public class YyNotificationLogVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @ExcelProperty(value = "主键")
    private Long id;

    /**
     * 租户编号
     */
    private String tenantId;

    @ExcelProperty(value = "门店ID")
    private Long storeId;

    @ExcelProperty(value = "订单ID")
    private Long orderId;

    @ExcelProperty(value = "客户ID")
    private Long customerId;

    @ExcelProperty(value = "模板ID")
    private Long templateId;

    @ExcelProperty(value = "通知渠道")
    private String channelType;

    @ExcelProperty(value = "接收人")
    private String receiver;

    @ExcelProperty(value = "发送状态")
    private String sendStatus;

    @ExcelProperty(value = "请求ID")
    private String requestId;

    @ExcelProperty(value = "错误信息")
    private String errorMessage;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @ExcelProperty(value = "发送时间")
    private Date sentTime;

    /**
     * 原始报文
     */
    private String rawPayload;

    @ExcelProperty(value = "备注")
    private String remark;

    @ExcelProperty(value = "创建时间")
    private Date createTime;

    @ExcelProperty(value = "更新时间")
    private Date updateTime;
}
