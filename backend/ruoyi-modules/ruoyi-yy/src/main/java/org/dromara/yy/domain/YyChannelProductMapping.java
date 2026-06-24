package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;
import java.io.Serial;

/**
 * 影约云渠道商品映射对象 yy_channel_product_mapping
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_channel_product_mapping")
public class YyChannelProductMapping extends TenantEntity {

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
     * 本地产品ID
     */
    private Long productId;

    /**
     * 渠道类型
     */
    private String channelType;

    /**
     * 外部商品ID
     */
    private String externalProductId;

    /**
     * 外部SKU
     */
    private String externalSkuId;

    /**
     * 外部门店POI
     */
    private String externalPoiId;

    /**
     * 真实下单入口链接
     */
    private String landingUrl;

    /**
     * 小程序/抖音路径
     */
    private String landingPath;

    /**
     * 外部商品名
     */
    private String externalName;

    /**
     * 映射状态
     */
    private String mappingStatus;

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
