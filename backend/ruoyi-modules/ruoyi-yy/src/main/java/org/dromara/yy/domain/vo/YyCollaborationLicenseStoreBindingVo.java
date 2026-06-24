package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

@Data
public class YyCollaborationLicenseStoreBindingVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;

    private Long licenseId;

    private Long storeId;

    private String storeName;

    private String bindStatus;

    private Date boundAt;

    private Date unboundAt;

    private String remark;
}
