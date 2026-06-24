package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;

/**
 * 首页汇总导出行对象。
 */
@Data
@ExcelIgnoreUnannotated
public class YyDashboardExportVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @ExcelProperty(value = "日期")
    private String date;

    @ExcelProperty(value = "门店ID")
    private String storeId;

    @ExcelProperty(value = "渠道")
    private String channel;

    @ExcelProperty(value = "实际收入(元)")
    private BigDecimal actualIncomeYuan;

    @ExcelProperty(value = "预计收入(元)")
    private BigDecimal expectedIncomeYuan;

    @ExcelProperty(value = "商品金额(元)")
    private BigDecimal productAmountYuan;

    @ExcelProperty(value = "优惠减免(元)")
    private BigDecimal discountAmountYuan;

    @ExcelProperty(value = "订单金额(元)")
    private BigDecimal orderAmountYuan;

    @ExcelProperty(value = "退款金额(元)")
    private BigDecimal refundAmountYuan;

    @ExcelProperty(value = "订单数")
    private Long orderCount;

    @ExcelProperty(value = "待服务数")
    private Long pendingOrderCount;

    @ExcelProperty(value = "服务中数")
    private Long servingOrderCount;

    @ExcelProperty(value = "已完成数")
    private Long completedOrderCount;

    @ExcelProperty(value = "已取消数")
    private Long canceledOrderCount;

    @ExcelProperty(value = "预约时段数")
    private Long slotCount;

    @ExcelProperty(value = "总容量")
    private Long capacityTotal;

    @ExcelProperty(value = "已约数")
    private Long paidCount;

    @ExcelProperty(value = "剩余数")
    private Long remainCount;

    @ExcelProperty(value = "冲突数")
    private Long conflictCount;

    @ExcelProperty(value = "Top产品摘要")
    private String topProductSummary;
}
