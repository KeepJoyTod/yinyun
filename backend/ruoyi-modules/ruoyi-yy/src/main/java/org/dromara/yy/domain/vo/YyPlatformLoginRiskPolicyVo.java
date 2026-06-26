package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
public class YyPlatformLoginRiskPolicyVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String policyCode;

    private String policyName;

    private String riskDimension;

    private String guardScope;

    private Date latestEventTime;

    private String status;

    private List<YyPlatformEvidenceVo> evidence = new ArrayList<>();

    private List<YyPlatformActionHintVo> nextActions = new ArrayList<>();
}
