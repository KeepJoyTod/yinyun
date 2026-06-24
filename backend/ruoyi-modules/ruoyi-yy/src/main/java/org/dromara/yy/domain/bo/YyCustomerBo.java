package org.dromara.yy.domain.bo;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.yy.domain.YyCustomer;

import java.math.BigDecimal;
import java.util.Date;

/**
 * 影约云客户业务对象 yy_customer
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyCustomer.class, reverseConvertGenerate = false)
public class YyCustomerBo extends BaseEntity {

    private String keyword;

    @NotNull(message = "主键不能为空", groups = {EditGroup.class})
    private Long id;

    @NotBlank(message = "客户姓名不能为空", groups = {AddGroup.class, EditGroup.class})
    private String customerName;

    @NotBlank(message = "手机号不能为空", groups = {AddGroup.class, EditGroup.class})
    private String mobile;

    private String gender;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date birthday;

    private String source;

    private String memberLevel;

    private Integer totalOrderCount;

    private BigDecimal totalSpend;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date lastOrderTime;

    private String tags;

    private String remark;
}
