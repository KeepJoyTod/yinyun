package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyCampaignBo;
import org.dromara.yy.domain.bo.YyCampaignProductBindBo;
import org.dromara.yy.domain.vo.YyCampaignScaffoldVo;
import org.dromara.yy.domain.vo.YyMarketingCampaignVo;
import org.dromara.yy.domain.vo.YyMarketingDashboardVo;

public interface IYyCampaignService {

    YyMarketingDashboardVo getMarketingDashboard();

    YyCampaignScaffoldVo getCampaignScaffold();

    TableDataInfo<YyMarketingCampaignVo> queryPageList(YyCampaignBo bo, PageQuery pageQuery);

    Boolean insertByBo(YyCampaignBo bo);

    Boolean updateByBo(YyCampaignBo bo);

    Boolean online(Long campaignId);

    Boolean offline(Long campaignId);

    Boolean bindProducts(Long campaignId, YyCampaignProductBindBo bo);
}
