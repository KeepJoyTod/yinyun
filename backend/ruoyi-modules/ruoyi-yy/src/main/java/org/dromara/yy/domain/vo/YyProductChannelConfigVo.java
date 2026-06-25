package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyProductChannelConfig;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyProductChannelConfig.class)
public class YyProductChannelConfigVo implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private String tenantId;
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
    private Date createTime;
    private Date updateTime;
}
