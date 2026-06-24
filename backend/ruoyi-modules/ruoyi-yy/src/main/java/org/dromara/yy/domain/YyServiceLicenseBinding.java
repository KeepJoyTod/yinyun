package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;

import java.io.Serial;
import java.util.Date;

/**
 * 协作套件许可证对象 yy_service_license_binding
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_service_license_binding")
public class YyServiceLicenseBinding extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id")
    private Long id;

    private String licenseKey;

    private String planName;

    private String status;

    private Date expireTime;

    private String boundStoreIds;

    private Integer seatCount;

    private Date activatedTime;

    private String renewAction;

    private String remark;

    @TableLogic
    private String delFlag;
}
