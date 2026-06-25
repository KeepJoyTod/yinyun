package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class YyAccountProfileVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String accountId;

    private String username;

    private String nickname;

    private String phoneMasked;

    private String email;

    private String status;
}
