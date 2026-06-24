package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

@Data
public class ClientMicroFormVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;

    private Long storeId;

    private String formName;

    private String status;

    private String schemaJson;

    private String linkKey;

    private Date publishedAt;
}
