package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;

import java.io.Serial;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_product_channel_config")
public class YyProductChannelConfig extends TenantEntity {
    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id")
    private Long id;
    private Long productId;
    private Long channelMappingId;
    private String channelType;
    private String externalProductId;
    private String externalSkuId;
    private String externalPoiId;
    private String landingUrl;
    private String landingPath;
    private String mappingStatus;
    private String status;
    private String remark;
    @TableLogic
    private String delFlag;
}
