package org.dromara.yy.domain.bo;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class YyCampaignProductBindBo {

    @NotEmpty(message = "绑定商品不能为空")
    private List<Long> productIds;
}
