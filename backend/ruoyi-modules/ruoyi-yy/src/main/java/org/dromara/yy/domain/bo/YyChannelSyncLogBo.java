package org.dromara.yy.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.yy.domain.YyChannelSyncLog;

/**
 * 影约云渠道同步日志业务对象 yy_channel_sync_log
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyChannelSyncLog.class, reverseConvertGenerate = false)
public class YyChannelSyncLogBo extends BaseEntity {

    /**
     * 主键
     */
    @NotNull(message = "主键不能为空", groups = { EditGroup.class })
    private Long id;

    /**
     * 门店ID
     */
    private Long storeId;

    @NotBlank(message = "渠道类型不能为空", groups = { AddGroup.class, EditGroup.class })
    /**
     * 渠道类型
     */
    private String channelType;

    @NotBlank(message = "接口名不能为空", groups = { AddGroup.class, EditGroup.class })
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
}
