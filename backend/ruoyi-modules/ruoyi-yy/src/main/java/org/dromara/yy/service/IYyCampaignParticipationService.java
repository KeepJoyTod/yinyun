package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyCampaignParticipationBo;
import org.dromara.yy.domain.vo.YyCampaignParticipationScaffoldVo;
import org.dromara.yy.domain.vo.YyMarketingParticipationRowVo;

import java.util.List;

public interface IYyCampaignParticipationService {

    List<YyCampaignParticipationScaffoldVo> listScaffold();

    TableDataInfo<YyMarketingParticipationRowVo> queryPageList(YyCampaignParticipationBo bo, PageQuery pageQuery);
}
