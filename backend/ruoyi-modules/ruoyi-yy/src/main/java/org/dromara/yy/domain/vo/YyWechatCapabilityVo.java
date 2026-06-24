package org.dromara.yy.domain.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;

/**
 * 微信生态接入能力
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class YyWechatCapabilityVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String code;
    private String title;
    private String scenario;
    private String status;
    private String priority;
    private String endpoint;
    private String nextAction;
}
