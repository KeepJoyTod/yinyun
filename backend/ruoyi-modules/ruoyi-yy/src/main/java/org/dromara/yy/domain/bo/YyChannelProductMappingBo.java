package org.dromara.yy.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.yy.domain.YyChannelProductMapping;

/**
 * 影约云渠道商品映射业务对象 yy_channel_product_mapping
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyChannelProductMapping.class, reverseConvertGenerate = false)
public class YyChannelProductMappingBo extends BaseEntity {

    /**
     * 主键
     */
    @NotNull(message = "主键不能为空", groups = { EditGroup.class })
    private Long id;

    /**
     * 门店ID
     */
    private Long storeId;

    @NotNull(message = "本地产品ID不能为空", groups = { AddGroup.class, EditGroup.class })
    /**
     * 本地产品ID
     */
    private Long productId;

    @NotBlank(message = "渠道类型不能为空", groups = { AddGroup.class, EditGroup.class })
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
}
