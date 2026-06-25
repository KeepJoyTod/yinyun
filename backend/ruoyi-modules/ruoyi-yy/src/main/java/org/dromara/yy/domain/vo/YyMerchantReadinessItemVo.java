package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Data
public class YyMerchantReadinessItemVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String moduleKey;

    private String moduleName;

    private String status;

    private String priority;

    private List<String> sourceItems = new ArrayList<>();

    private List<String> blockers = new ArrayList<>();

    private List<String> nextActions = new ArrayList<>();

    private List<String> evidenceRefs = new ArrayList<>();
}
