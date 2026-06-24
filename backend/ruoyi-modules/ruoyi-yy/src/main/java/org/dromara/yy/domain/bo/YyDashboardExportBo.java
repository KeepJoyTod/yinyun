package org.dromara.yy.domain.bo;

import lombok.Data;

/**
 * 首页汇总导出请求对象。
 */
@Data
public class YyDashboardExportBo {

    /**
     * 开始日期 yyyy-MM-dd。
     */
    private String beginDate;

    /**
     * 结束日期 yyyy-MM-dd。
     */
    private String endDate;

    /**
     * 门店ID，空表示全部门店。
     */
    private Long storeId;

    /**
     * 渠道类型，空表示全部渠道。
     */
    private String channelType;
}
