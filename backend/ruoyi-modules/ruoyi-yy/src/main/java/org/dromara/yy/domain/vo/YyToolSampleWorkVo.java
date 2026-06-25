package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class YyToolSampleWorkVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String sampleId;

    private String title;

    private String albumId;

    private String publishStatus;

    private String status;
}
