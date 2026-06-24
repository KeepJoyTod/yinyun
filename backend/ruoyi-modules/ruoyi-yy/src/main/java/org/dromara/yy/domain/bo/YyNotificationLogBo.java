package org.dromara.yy.domain.bo;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.yy.domain.YyNotificationLog;

import java.util.Date;

/**
 * 通知发送日志业务对象 yy_notification_log
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyNotificationLog.class, reverseConvertGenerate = false)
public class YyNotificationLogBo extends BaseEntity {

    /**
     * 主键
     */
    @NotNull(message = "主键不能为空", groups = { EditGroup.class })
    private Long id;

    /**
     * 门店ID
     */
    private Long storeId;

    /**
     * 订单ID
     */
    private Long orderId;

    /**
     * 客户ID
     */
    private Long customerId;

    /**
     * 模板ID
     */
    private Long templateId;

    /**
     * 通知渠道
     */
    private String channelType;

    /**
     * 接收人
     */
    private String receiver;

    /**
     * 发送状态
     */
    private String sendStatus;

    /**
     * 请求ID
     */
    private String requestId;

    /**
     * 错误信息
     */
    private String errorMessage;

    /**
     * 发送时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date sentTime;

    /**
     * 原始报文
     */
    private String rawPayload;

    /**
     * 备注
     */
    private String remark;
}
