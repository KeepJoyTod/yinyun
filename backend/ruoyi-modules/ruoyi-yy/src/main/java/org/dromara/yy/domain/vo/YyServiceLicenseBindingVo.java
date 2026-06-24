package org.dromara.yy.domain.vo;

import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyServiceLicenseBinding;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 协作套件许可证视图对象。
 */
@Data
@AutoMapper(target = YyServiceLicenseBinding.class)
public class YyServiceLicenseBindingVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;

    private String tenantId;

    private String licenseKey;

    private String planName;

    private String status;

    private Date expireTime;

    private String boundStoreIds;

    private Integer seatCount;

    private Date activatedTime;

    private String renewAction;

    private String remark;

    private Date createTime;

    private Date updateTime;
}
