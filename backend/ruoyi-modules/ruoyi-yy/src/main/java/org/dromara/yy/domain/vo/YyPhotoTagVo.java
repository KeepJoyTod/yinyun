package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyPhotoTag;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 璧勬簮鏍囩瑙嗗浘瀵硅薄 yy_photo_tag
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyPhotoTag.class)
public class YyPhotoTagVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @ExcelProperty(value = "鏍囩ID")
    private Long id;

    private String tenantId;

    @ExcelProperty(value = "闂ㄥ簵ID")
    private Long storeId;

    @ExcelProperty(value = "闂ㄥ簵鍚嶇О")
    private String storeName;

    @ExcelProperty(value = "鏍囩鍚嶇О")
    private String tagName;

    @ExcelProperty(value = "璧勬簮鏁伴噺")
    private Long resourceCount;

    private Long createBy;

    @ExcelProperty(value = "鍒涘缓鏃堕棿")
    private Date createTime;
}
