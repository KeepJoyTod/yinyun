package org.dromara.yy.service.impl;

import org.dromara.yy.domain.vo.YyCampaignScaffoldItemVo;
import org.dromara.yy.domain.vo.YyCampaignScaffoldVo;
import org.dromara.yy.domain.vo.YyMarketingChannelSummaryVo;
import org.dromara.yy.domain.vo.YyMarketingDashboardMetricVo;
import org.dromara.yy.domain.vo.YyMarketingDashboardVo;
import org.dromara.yy.service.IYyCampaignService;
import org.springframework.stereotype.Service;

@Service
public class YyCampaignServiceImpl implements IYyCampaignService {

    @Override
    public YyMarketingDashboardVo getMarketingDashboard() {
        YyMarketingDashboardVo dashboard = new YyMarketingDashboardVo();
        dashboard.setStatus("scaffold");
        dashboard.setBoundary("营销总览脚手架当前继续聚合 yy_order 来源与支付信息，不复制订单主账本。");
        dashboard.getMetrics().add(metric("campaignOrderCount", "活动相关订单", "12", "活动/券/渠道来源命中的统一订单数量。"));
        dashboard.getMetrics().add(metric("paidOrderCount", "已支付转化", "8", "已支付或部分支付的活动相关订单。"));
        dashboard.getMetrics().add(metric("sourceCount", "来源渠道", "4", "当前聚合到的营销来源数量。"));
        dashboard.getMetrics().add(metric("pendingCount", "待跟进", "4", "仍需支付、确认或回访的活动相关订单。"));
        dashboard.getChannels().add(channel("抖音来客", 5, 3, 2, 59_700L));
        dashboard.getChannels().add(channel("微信扫码", 4, 3, 1, 42_800L));
        dashboard.getChannels().add(channel("美团团购", 3, 2, 1, 26_600L));
        return dashboard;
    }

    @Override
    public YyCampaignScaffoldVo getCampaignScaffold() {
        YyCampaignScaffoldVo scaffold = new YyCampaignScaffoldVo();
        scaffold.setStatus("scaffold");
        scaffold.setBoundary("活动清单脚手架保留真实活动表结构，当前统计先用统一订单来源示意活动承接量。");
        scaffold.getCampaigns().add(campaign("campaign-seckill-01", "证件照秒杀首发", "SECKILL", "scaffold", "滨州万达店", "证件照", "2026-06-24 ~ 2026-07-24", 12, 5, 59_700L));
        scaffold.getCampaigns().add(campaign("campaign-groupbuy-01", "拼团裂变脚手架", "GROUP_BUY", "scaffold", "滨州万达店", "家庭套餐", "2026-06-24 ~ 2026-08-01", 6, 3, 26_600L));
        scaffold.getSources().add(channel("抖音来客", 5, 3, 2, 59_700L));
        scaffold.getSources().add(channel("微信扫码", 4, 3, 1, 42_800L));
        return scaffold;
    }

    private static YyMarketingDashboardMetricVo metric(String code, String label, String value, String hint) {
        YyMarketingDashboardMetricVo vo = new YyMarketingDashboardMetricVo();
        vo.setMetricCode(code);
        vo.setLabel(label);
        vo.setValue(value);
        vo.setHint(hint);
        return vo;
    }

    private static YyMarketingChannelSummaryVo channel(String sourceLabel, Integer orderCount, Integer paidOrderCount, Integer pendingCount, Long paidAmountCent) {
        YyMarketingChannelSummaryVo vo = new YyMarketingChannelSummaryVo();
        vo.setSourceLabel(sourceLabel);
        vo.setOrderCount(orderCount);
        vo.setPaidOrderCount(paidOrderCount);
        vo.setPendingCount(pendingCount);
        vo.setPaidAmountCent(paidAmountCent);
        return vo;
    }

    private static YyCampaignScaffoldItemVo campaign(
        String id,
        String name,
        String type,
        String status,
        String storeScope,
        String productScope,
        String timeRange,
        Integer participantCount,
        Integer orderCount,
        Long paidAmountCent
    ) {
        YyCampaignScaffoldItemVo vo = new YyCampaignScaffoldItemVo();
        vo.setCampaignId(id);
        vo.setCampaignName(name);
        vo.setCampaignType(type);
        vo.setStatus(status);
        vo.setStoreScopeLabel(storeScope);
        vo.setProductScopeLabel(productScope);
        vo.setTimeRangeLabel(timeRange);
        vo.setParticipantCount(participantCount);
        vo.setOrderCount(orderCount);
        vo.setPaidAmountCent(paidAmountCent);
        return vo;
    }
}
