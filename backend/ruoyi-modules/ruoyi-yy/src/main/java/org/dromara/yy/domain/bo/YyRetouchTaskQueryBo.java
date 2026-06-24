package org.dromara.yy.domain.bo;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.mybatis.core.domain.BaseEntity;

/**
 * 三方修图任务查询对象。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class YyRetouchTaskQueryBo extends BaseEntity {

    private Long storeId;

    private Long providerId;

    private String status;

    private String keyword;
}
