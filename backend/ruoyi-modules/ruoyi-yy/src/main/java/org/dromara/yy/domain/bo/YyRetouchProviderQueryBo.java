package org.dromara.yy.domain.bo;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.mybatis.core.domain.BaseEntity;

/**
 * 三方修图服务商查询对象。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class YyRetouchProviderQueryBo extends BaseEntity {

    private String keyword;

    private String applicationStatus;

    private String status;
}
