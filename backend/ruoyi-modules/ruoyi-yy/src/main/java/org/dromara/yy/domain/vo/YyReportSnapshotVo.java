package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import cn.idev.excel.annotation.format.DateTimeFormat;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyReportSnapshot;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

/**
 * 经营报表快照视图对象 yy_report_snapshot
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyReportSnapshot.class)
public class YyReportSnapshotVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @ExcelProperty(value = "主键")
    private Long id;

    /**
     * 租户编号
     */
    private String tenantId;

    @ExcelProperty(value = "门店ID")
    private Long storeId;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @DateTimeFormat("yyyy-MM-dd")
    @ExcelProperty(value = "报表日期")
    private Date reportDate;

    @ExcelProperty(value = "报表类型")
    private String reportType;

    @ExcelProperty(value = "订单总数")
    private Integer orderTotal;

    @ExcelProperty(value = "到店总数")
    private Integer arrivedTotal;

    @ExcelProperty(value = "完成总数")
    private Integer completedTotal;

    @ExcelProperty(value = "收入合计")
    private BigDecimal revenueTotal;

    @ExcelProperty(value = "选片收入")
    private BigDecimal selectionTotal;

    @ExcelProperty(value = "来源汇总JSON")
    private String sourceSummary;

    @ExcelProperty(value = "备注")
    private String remark;

    @ExcelProperty(value = "创建时间")
    private Date createTime;

    @ExcelProperty(value = "更新时间")
    private Date updateTime;
}
