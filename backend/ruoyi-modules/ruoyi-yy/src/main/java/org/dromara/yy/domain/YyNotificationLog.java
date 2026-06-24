package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;

import java.io.Serial;
import java.util.Date;

/**
 * 通知发送日志对象 yy_notification_log
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_notification_log")
public class YyNotificationLog extends TenantEntity {

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
    private Date sentTime;

    /**
     * 原始报文
     */
    private String rawPayload;

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
