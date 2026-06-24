package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;
import java.io.Serial;

/**
 * 影约云渠道同步日志对象 yy_channel_sync_log
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_channel_sync_log")
public class YyChannelSyncLog extends TenantEntity {

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
     * 渠道类型
     */
    private String channelType;

    /**
     * 接口名
     */
    private String apiName;

    /**
     * 请求ID
     */
    private String requestId;

    /**
     * 是否成功
     */
    private String success;

    /**
     * 错误信息
     */
    private String errorMessage;

    /**
     * 耗时毫秒
     */
    private Long durationMs;

    /**
     * 是否可重试
     */
    private String retryable;

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
