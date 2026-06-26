package org.dromara.yy.service;

import org.dromara.yy.domain.vo.YyOrderAnalysisScaffoldVo;

public interface IYyOrderAnalysisService {

    YyOrderAnalysisScaffoldVo queryOverview(Long storeId, String dateFrom, String dateTo);
}
