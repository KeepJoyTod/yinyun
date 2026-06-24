package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

@Data
public class YyMerchantMicroPagePublicVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;

    private Long storeId;

    private String pageTitle;

    private String pageDesc;

    private String coverUrl;

    private String backgroundColor;

    private String editMode;

    private String status;

    private String configJson;

    private String linkKey;

    private Date publishedAt;
}
