package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Data
public class YyCustomerExperienceP1ReviewDraftResultVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String status;

    private String message;

    private List<String> evidenceRefs = new ArrayList<>();
}
