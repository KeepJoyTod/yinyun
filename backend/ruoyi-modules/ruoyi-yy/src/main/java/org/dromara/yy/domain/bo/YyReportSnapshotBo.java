package org.dromara.yy.domain.bo;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.yy.domain.YyReportSnapshot;

import java.math.BigDecimal;
import java.util.Date;

/**
 * 经营报表快照业务对象 yy_report_snapshot
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyReportSnapshot.class, reverseConvertGenerate = false)
public class YyReportSnapshotBo extends BaseEntity {

    /**
     * 主键
     */
    @NotNull(message = "主键不能为空", groups = { EditGroup.class })
    private Long id;

    /**
     * 门店ID
     */
    private Long storeId;

    /**
     * 报表日期
     */
    @NotNull(message = "报表日期不能为空", groups = { AddGroup.class, EditGroup.class })
    @JsonFormat(pattern = "yyyy-MM-dd")
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
}
