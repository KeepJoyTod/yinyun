package org.dromara.yy.domain.bo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Data
public class YyCustomerExperienceP1ReviewDraftBo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String orderId;

    private Integer rating;

    private List<String> tags = new ArrayList<>();

    private String remark;
}
