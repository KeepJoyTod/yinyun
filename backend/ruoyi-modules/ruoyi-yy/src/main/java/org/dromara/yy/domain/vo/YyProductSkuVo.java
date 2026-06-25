package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyProductSku;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyProductSku.class)
public class YyProductSkuVo implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private String tenantId;
    private Long productId;
    private String specName;
    private BigDecimal originalPrice;
    private BigDecimal salePrice;
    private Integer workstationCost;
    private String onShow;
    private String status;
    private Integer sort;
    private String remark;
    private Date createTime;
    private Date updateTime;
}
