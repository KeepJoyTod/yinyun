package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class YyAccountBrandVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String brandId;

    private String brandName;

    private Boolean defaultBrand;

    private String status;
}
