package org.dromara.yy.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.yy.domain.YyNotificationTemplate;

/**
 * 通知模板业务对象 yy_notification_template
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyNotificationTemplate.class, reverseConvertGenerate = false)
public class YyNotificationTemplateBo extends BaseEntity {

    /**
     * 主键
     */
    @NotNull(message = "主键不能为空", groups = { EditGroup.class })
    private Long id;

    /**
     * 模板编码
     */
    @NotBlank(message = "模板编码不能为空", groups = { AddGroup.class, EditGroup.class })
    private String templateCode;

    /**
     * 业务场景
     */
    @NotBlank(message = "业务场景不能为空", groups = { AddGroup.class, EditGroup.class })
    private String scene;

    /**
     * 通知渠道
     */
    @NotBlank(message = "通知渠道不能为空", groups = { AddGroup.class, EditGroup.class })
    private String channelType;

    /**
     * 标题
     */
    private String title;

    /**
     * 模板内容
     */
    @NotBlank(message = "模板内容不能为空", groups = { AddGroup.class, EditGroup.class })
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
}
