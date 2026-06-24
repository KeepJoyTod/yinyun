package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnore;
import cn.idev.excel.annotation.ExcelProperty;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 工单视图对象
 */
@Data
public class YyWorkOrderVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @ExcelProperty("主键")
    private Long id;

    @ExcelProperty("门店ID")
    private Long storeId;

    @ExcelProperty("工单编号")
    private String orderNo;

    @ExcelProperty("关联订单ID")
    private Long orderId;

    @ExcelProperty("工单类型")
    private String orderType;

    @ExcelProperty("工单状态")
    private String status;

    @ExcelProperty("优先级")
    private String priority;

    @ExcelProperty("处理人ID")
    private Long handlerId;

    @ExcelProperty("处理人姓名")
    private String handlerName;

    @ExcelProperty("描述")
    private String description;

    @ExcelProperty("备注")
    private String remark;

    @ExcelIgnore
    private Date createTime;
}
