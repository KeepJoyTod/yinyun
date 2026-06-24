package org.dromara.yy.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.yy.domain.YyServiceLicenseBinding;

import java.util.Date;

/**
 * 协作套件许可证业务对象。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyServiceLicenseBinding.class, reverseConvertGenerate = false)
public class YyServiceLicenseBindingBo extends BaseEntity {

    private Long id;

    @NotBlank(message = "许可证不能为空")
    private String licenseKey;

    private String planName;

    private String status;

    private Date expireTime;

    private String boundStoreIds;

    private Integer seatCount;

    private Date activatedTime;

    private String renewAction;

    private String remark;
}
