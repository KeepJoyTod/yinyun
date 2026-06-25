package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
public class YyPlatformServicePackageStatusVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String packageCode;

    private String packageName;

    private String versionLabel;

    private String status;

    private Date expireTime;

    private String boundStoreIds;

    private Integer seatCount;

    private List<YyPlatformEvidenceVo> evidence = new ArrayList<>();

    private List<YyPlatformActionHintVo> nextActions = new ArrayList<>();
}
