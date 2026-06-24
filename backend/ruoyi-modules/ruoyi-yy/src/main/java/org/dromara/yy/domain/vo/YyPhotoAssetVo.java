package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyPhotoAsset;
import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 影约云底片视图对象 yy_photo_asset
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyPhotoAsset.class)
public class YyPhotoAssetVo implements Serializable {

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

    @ExcelProperty(value = "相册ID")
    /**
     * 相册ID
     */
    private Long albumId;

    @ExcelProperty(value = "文件名")
    /**
     * 文件名
     */
    private String fileName;

    @ExcelProperty(value = "文件地址")
    /**
     * 文件地址
     */
    private String fileUrl;

    @ExcelProperty(value = "OSS对象Key")
    /**
     * OSS对象Key
     */
    private String objectKey;

    @ExcelProperty(value = "缩略图OSS对象Key")
    /**
     * 缩略图OSS对象Key
     */
    private String thumbnailObjectKey;

    @ExcelProperty(value = "排序")
    /**
     * 排序
     */
    private Integer sort;

    @ExcelProperty(value = "是否已选")
    /**
     * 是否已选
     */
    private String isSelected;

    @ExcelProperty(value = "客户可见")
    /**
     * 客户可见
     */
    private String visible;

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
