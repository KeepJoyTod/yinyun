package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyMerchantDecoration;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyMerchantDecoration.class)
public class YyMerchantDecorationVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;

    private String tenantId;

    private Long storeId;

    private String channelType;

    private String status;

    private String configJson;

    private String publishedConfigJson;

    private Long shareIconOssId;

    private Long watermarkOssId;

    private Date publishedAt;

    private String previewToken;

    private String remark;

    private Date createTime;

    private Date updateTime;
}
