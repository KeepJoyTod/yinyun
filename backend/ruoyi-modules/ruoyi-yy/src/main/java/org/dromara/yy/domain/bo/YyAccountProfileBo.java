package org.dromara.yy.domain.bo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class YyAccountProfileBo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String nickname;

    private String phoneMasked;

    private String email;
}
