package org.dromara.yy.domain.bo;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.yy.domain.YyChannelPlugin;
import java.util.Date;

/**
 * 影约云渠道插件业务对象 yy_channel_plugin
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyChannelPlugin.class, reverseConvertGenerate = false)
public class YyChannelPluginBo extends BaseEntity {

    /**
     * 主键
     */
    @NotNull(message = "主键不能为空", groups = { EditGroup.class })
    private Long id;

    @NotBlank(message = "渠道类型不能为空", groups = { AddGroup.class, EditGroup.class })
    /**
     * 渠道类型
     */
    private String channelType;

    @NotBlank(message = "插件名称不能为空", groups = { AddGroup.class, EditGroup.class })
    /**
     * 插件名称
     */
    private String pluginName;

    /**
     * 是否启用
     */
    private String enabled;

    /**
     * 授权状态
     */
    private String authStatus;

    /**
     * 未开通提示
     */
    private String openTip;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    /**
     * 最后同步时间
     */
    private Date lastSyncTime;

    /**
     * 备注
     */
    private String remark;
}
