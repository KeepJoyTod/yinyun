package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

@Data
public class ClientMicroFormSubmitVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long submissionId;

    private String status;

    private Date submittedAt;
}
