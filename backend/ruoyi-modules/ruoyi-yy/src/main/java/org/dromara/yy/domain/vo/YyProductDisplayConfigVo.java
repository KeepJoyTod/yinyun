package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyProductDisplayConfig;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyProductDisplayConfig.class)
public class YyProductDisplayConfigVo implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private String tenantId;
    private Long productId;
    private String showPlatform;
    private String bookingButtonText;
    private String directUrl;
    private String qrScene;
    private String onlineBookingFlag;
    private String storeOrderFlag;
    private String detailButtonMode;
    private String status;
    private String remark;
    private Date createTime;
    private Date updateTime;
}
