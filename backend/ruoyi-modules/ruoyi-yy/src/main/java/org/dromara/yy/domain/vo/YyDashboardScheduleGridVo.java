package org.dromara.yy.domain.vo;

import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * 排期看板14天网格视图对象。
 */
@Data
public class YyDashboardScheduleGridVo {

    private Long storeId;

    /**
     * 14天日期列表，yyyy-MM-dd
     */
    private List<String> dates;

    /**
     * 按日期分组的时段列表：key = yyyy-MM-dd, value = 当日所有时段
     */
    private Map<String, List<YyDashboardScheduleGridSlotVo>> slotsByDate;
}
