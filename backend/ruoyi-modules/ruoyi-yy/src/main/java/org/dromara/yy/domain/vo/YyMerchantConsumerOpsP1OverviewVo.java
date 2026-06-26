package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Data
public class YyMerchantConsumerOpsP1OverviewVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String title;

    private String status;

    private String updatedAt;

    private List<YyMerchantConsumerOpsP1ItemVo> items = new ArrayList<>();

    private List<String> dataLedgers = new ArrayList<>();

    private List<String> deliveryStandard = new ArrayList<>();
}
