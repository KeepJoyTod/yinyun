package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;

import java.io.Serial;

/**
 * 三方修图服务商对象 yy_retouch_provider
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_retouch_provider")
public class YyRetouchProvider extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id")
    private Long id;

    private String providerCode;

    private String providerName;

    private String contactName;

    private String contactPhone;

    /**
     * 逗号分隔的门店 ID 列表；空串表示当前租户全门店可见。
     */
    private String supportedStoreIds;

    private String serviceScope;

    private String quoteMode;

    private String settlementMode;

    private String applicationStatus;

    private String status;

    private Integer ratingScore;

    private Integer slaHours;

    private String remark;

    @TableLogic
    private String delFlag;
}
