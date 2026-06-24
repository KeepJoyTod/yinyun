package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;

import java.io.Serial;

/**
 * 通知模板对象 yy_notification_template
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_notification_template")
public class YyNotificationTemplate extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @TableId(value = "id")
    private Long id;

    /**
     * 模板编码
     */
    private String templateCode;

    /**
     * 业务场景
     */
    private String scene;

    /**
     * 通知渠道
     */
    private String channelType;

    /**
     * 标题
     */
    private String title;

    /**
     * 模板内容
     */
    private String content;

    /**
     * 服务商模板ID
     */
    private String providerTemplateId;

    /**
     * 是否启用
     */
    private String enabled;

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
