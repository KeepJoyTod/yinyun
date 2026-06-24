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
 * 褰辩害浜戝簳鐗囪鍥惧璞?yy_photo_asset
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyPhotoAsset.class)
public class YyPhotoAssetVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @ExcelProperty(value = "涓婚敭")
    private Long id;

    private String tenantId;

    @ExcelProperty(value = "闂ㄥ簵ID")
    private Long storeId;

    @ExcelProperty(value = "鐩稿唽ID")
    private Long albumId;

    @ExcelProperty(value = "鏂囦欢鍚?")
    private String fileName;

    @ExcelProperty(value = "鏂囦欢鍦板潃")
    private String fileUrl;

    @ExcelProperty(value = "OSS瀵硅薄Key")
    private String objectKey;

    @ExcelProperty(value = "缂╃暐鍥綩SS瀵硅薄Key")
    private String thumbnailObjectKey;

    @ExcelProperty(value = "鎺掑簭")
    private Integer sort;

    @ExcelProperty(value = "鏄惁宸查€?")
    private String isSelected;

    @ExcelProperty(value = "瀹㈡埛鍙")
    private String visible;

    @ExcelProperty(value = "璧勬簮绫诲瀷")
    private String assetType;

    @ExcelProperty(value = "璇勬槦")
    private Integer rating;

    @ExcelProperty(value = "鏂囦欢澶у皬(瀛楄妭)")
    private Long fileSizeBytes;

    private Long createBy;

    @ExcelProperty(value = "澶囨敞")
    private String remark;

    @ExcelProperty(value = "鍒涘缓鏃堕棿")
    private Date createTime;

    @ExcelProperty(value = "鏇存柊鏃堕棿")
    private Date updateTime;
}
