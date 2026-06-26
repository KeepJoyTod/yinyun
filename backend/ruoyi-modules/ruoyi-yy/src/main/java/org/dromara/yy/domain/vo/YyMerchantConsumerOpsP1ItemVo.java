package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Data
public class YyMerchantConsumerOpsP1ItemVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String itemKey;

    private String itemName;

    private String status;

    private String risk;

    private List<String> sourceItems = new ArrayList<>();

    private List<String> existingOwners = new ArrayList<>();

    private List<String> missingCapabilities = new ArrayList<>();

    private List<String> nextSteps = new ArrayList<>();

    private List<String> evidenceRefs = new ArrayList<>();
}
