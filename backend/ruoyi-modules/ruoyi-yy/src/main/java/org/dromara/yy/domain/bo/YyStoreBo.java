package org.dromara.yy.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.yy.domain.YyStore;

/**
 * 影约云门店业务对象 yy_store
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyStore.class, reverseConvertGenerate = false)
public class YyStoreBo extends BaseEntity {

    /**
     * 主键
     */
    @NotNull(message = "主键不能为空", groups = { EditGroup.class })
    private Long id;

    @NotBlank(message = "门店编码不能为空", groups = { AddGroup.class, EditGroup.class })
    /**
     * 门店编码
     */
    private String storeCode;

    @NotBlank(message = "门店名称不能为空", groups = { AddGroup.class, EditGroup.class })
    /**
     * 门店名称
     */
    private String storeName;

    /**
     * 营业状态
     */
    private String status;

    /**
     * 联系电话
     */
    private String phone;

    /**
     * 门店地址
     */
    private String address;

    /**
     * 营业时间
     */
    private String businessHours;

    /**
     * 排序
     */
    private Integer sort;

    /**
     * 备注
     */
    private String remark;
}
