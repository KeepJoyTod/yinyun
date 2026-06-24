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
 * 影约云渠道插件对象 yy_channel_plugin
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_channel_plugin")
public class YyChannelPlugin extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @TableId(value = "id")
    private Long id;

    /**
     * 渠道类型
     */
    private String channelType;

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

    /**
     * 最后同步时间
     */
    private Date lastSyncTime;

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
