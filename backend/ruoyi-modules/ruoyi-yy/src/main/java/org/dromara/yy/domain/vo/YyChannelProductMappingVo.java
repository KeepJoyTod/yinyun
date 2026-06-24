package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyChannelProductMapping;
import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 影约云渠道商品映射视图对象 yy_channel_product_mapping
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyChannelProductMapping.class)
public class YyChannelProductMappingVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @ExcelProperty(value = "主键")
    private Long id;

    /**
     * 租户编号
     */
    private String tenantId;

    @ExcelProperty(value = "门店ID")
    /**
     * 门店ID
     */
    private Long storeId;

    @ExcelProperty(value = "本地产品ID")
    /**
     * 本地产品ID
     */
    private Long productId;

    @ExcelProperty(value = "渠道类型")
    /**
     * 渠道类型
     */
    private String channelType;

    @ExcelProperty(value = "外部商品ID")
    /**
     * 外部商品ID
     */
    private String externalProductId;

    @ExcelProperty(value = "外部SKU")
    /**
     * 外部SKU
     */
    private String externalSkuId;

    @ExcelProperty(value = "外部门店POI")
    /**
     * 外部门店POI
     */
    private String externalPoiId;

    @ExcelProperty(value = "真实下单入口链接")
    /**
     * 真实下单入口链接
     */
    private String landingUrl;

    @ExcelProperty(value = "小程序/抖音路径")
    /**
     * 小程序/抖音路径
     */
    private String landingPath;

    @ExcelProperty(value = "外部商品名")
    /**
     * 外部商品名
     */
    private String externalName;

    @ExcelProperty(value = "映射状态")
    /**
     * 映射状态
     */
    private String mappingStatus;

    @ExcelProperty(value = "备注")
    /**
     * 备注
     */
    private String remark;

    /**
     * 创建时间
     */
    @ExcelProperty(value = "创建时间")
    private Date createTime;

    /**
     * 更新时间
     */
    @ExcelProperty(value = "更新时间")
    private Date updateTime;
}
