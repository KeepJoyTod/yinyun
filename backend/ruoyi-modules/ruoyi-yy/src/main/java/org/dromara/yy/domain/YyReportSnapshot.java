package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;

import java.io.Serial;
import java.math.BigDecimal;
import java.util.Date;

/**
 * 经营报表快照对象 yy_report_snapshot
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_report_snapshot")
public class YyReportSnapshot extends TenantEntity {

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
     * 报表日期
     */
    private Date reportDate;

    /**
     * 报表类型
     */
    private String reportType;

    /**
     * 订单总数
     */
    private Integer orderTotal;

    /**
     * 到店总数
     */
    private Integer arrivedTotal;

    /**
     * 完成总数
     */
    private Integer completedTotal;

    /**
     * 收入合计
     */
    private BigDecimal revenueTotal;

    /**
     * 选片收入
     */
    private BigDecimal selectionTotal;

    /**
     * 来源汇总JSON
     */
    private String sourceSummary;

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
