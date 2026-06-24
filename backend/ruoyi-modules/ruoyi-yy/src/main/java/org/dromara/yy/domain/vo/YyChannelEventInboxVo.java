package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyChannelEventInbox;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 渠道事件收件箱视图对象 yy_channel_event_inbox。
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyChannelEventInbox.class)
public class YyChannelEventInboxVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @ExcelProperty(value = "主键")
    private Long id;

    private String tenantId;

    @ExcelProperty(value = "渠道类型")
    private String channelType;

    @ExcelProperty(value = "事件类型")
    private String eventType;

    @ExcelProperty(value = "事件ID")
    private String eventId;

    @ExcelProperty(value = "外部订单号")
    private String externalOrderId;

    @ExcelProperty(value = "请求ID")
    private String requestId;

    @ExcelProperty(value = "签名有效")
    private String signatureValid;

    @ExcelProperty(value = "处理状态")
    private String processStatus;

    @ExcelProperty(value = "重试次数")
    private Integer retryCount;

    @ExcelProperty(value = "下次重试时间")
    private Date nextRetryTime;

    @ExcelProperty(value = "原始报文")
    private String rawPayload;

    @ExcelProperty(value = "错误信息")
    private String errorMessage;

    @ExcelProperty(value = "处理时间")
    private Date processedTime;

    @ExcelProperty(value = "备注")
    private String remark;

    @ExcelProperty(value = "创建时间")
    private Date createTime;

    @ExcelProperty(value = "更新时间")
    private Date updateTime;
}
