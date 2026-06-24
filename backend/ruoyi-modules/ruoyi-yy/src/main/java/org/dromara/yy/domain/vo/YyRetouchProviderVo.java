package org.dromara.yy.domain.vo;

import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyRetouchProvider;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 三方修图服务商视图对象。
 */
@Data
@AutoMapper(target = YyRetouchProvider.class)
public class YyRetouchProviderVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;

    private String tenantId;

    private String providerCode;

    private String providerName;

    private String contactName;

    private String contactPhone;

    private String supportedStoreIds;

    private String serviceScope;

    private String quoteMode;

    private String settlementMode;

    private String applicationStatus;

    private String status;

    private Integer ratingScore;

    private Integer slaHours;

    private String remark;

    private Date createTime;

    private Date updateTime;
}
