package org.dromara.yy.domain.bo;

import lombok.Data;

import java.util.List;

/**
 * 订单属性快照和值。
 */
@Data
public class YyOrderAttributeValueBo {

    private String fieldCode;

    private String fieldLabel;

    private String fieldType;

    private Boolean required;

    private List<String> options;

    private Integer sort;

    private Object value;
}
