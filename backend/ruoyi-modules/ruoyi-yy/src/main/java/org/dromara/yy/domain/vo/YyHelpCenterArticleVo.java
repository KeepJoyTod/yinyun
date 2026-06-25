package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class YyHelpCenterArticleVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String articleId;

    private String title;

    private String keyword;

    private String status;
}
