package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;
import java.io.Serial;

/**
 * 影约云门店对象 yy_store
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_store")
public class YyStore extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @TableId(value = "id")
    private Long id;

    /**
     * 门店编码
     */
    private String storeCode;

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

    /**
     * 删除标志
     */
    @TableLogic
    private String delFlag;
}
