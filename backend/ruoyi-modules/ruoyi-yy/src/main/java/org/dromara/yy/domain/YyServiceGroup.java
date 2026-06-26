package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;

import java.io.Serial;

/**
 * 影约云服务组对象 yy_service_group
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_service_group")
public class YyServiceGroup extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @TableId(value = "id")
    private Long id;

    /**
     * 门店ID
     */
    private Long storeId;

    /**
     * 服务组编码
     */
    private String groupCode;

    /**
     * 服务组名称
     */
    private String groupName;

    /**
     * 可预约容量
     */
    private Integer capacity;

    /**
     * 服务时长
     */
    private Integer durationMinutes;

    /**
     * 服务模式
     */
    private String serviceMode;

    /**
     * 状态
     */
    private String status;

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
