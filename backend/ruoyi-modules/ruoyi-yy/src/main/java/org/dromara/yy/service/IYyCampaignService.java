package org.dromara.yy.service;

import org.dromara.yy.domain.vo.YyCampaignScaffoldVo;
import org.dromara.yy.domain.vo.YyMarketingDashboardVo;

public interface IYyCampaignService {

    YyMarketingDashboardVo getMarketingDashboard();

    YyCampaignScaffoldVo getCampaignScaffold();
}
