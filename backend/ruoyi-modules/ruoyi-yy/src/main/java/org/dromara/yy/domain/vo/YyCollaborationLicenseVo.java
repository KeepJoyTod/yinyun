package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
public class YyCollaborationLicenseVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;

    private String licenseKey;

    private String licenseName;

    private String authStatus;

    private String enabled;

    private Date validFrom;

    private Date validTo;

    private Integer seatCount;

    private String remark;

    private Date createTime;

    private Date updateTime;

    private List<YyCollaborationLicenseStoreBindingVo> boundStores = new ArrayList<>();
}
