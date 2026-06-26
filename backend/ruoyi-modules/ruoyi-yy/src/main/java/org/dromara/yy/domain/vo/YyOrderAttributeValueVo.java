package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

/**
 * 订单属性快照和值。
 */
@Data
public class YyOrderAttributeValueVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String fieldCode;

    private String fieldLabel;

    private String fieldType;

    private Boolean required;

    private List<String> options;

    private Integer sort;

    private Object value;
}
