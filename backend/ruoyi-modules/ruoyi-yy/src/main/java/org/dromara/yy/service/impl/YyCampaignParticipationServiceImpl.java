package org.dromara.yy.service.impl;

import org.dromara.yy.domain.vo.YyCampaignParticipationScaffoldVo;
import org.dromara.yy.service.IYyCampaignParticipationService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class YyCampaignParticipationServiceImpl implements IYyCampaignParticipationService {

    @Override
    public List<YyCampaignParticipationScaffoldVo> listScaffold() {
        return List.of(
            participation("participation-1", "campaign-seckill-01", "证件照秒杀首发", "张三", "138****8000", "抖音来客", "order-1001", "已转化", 19_900L, 16_900L, "继续跟进服务履约与复购。"),
            participation("participation-2", "campaign-groupbuy-01", "拼团裂变脚手架", "李四", "139****9000", "微信扫码", "order-1002", "待跟进", 29_900L, 29_900L, "优先跟进支付和到店确认。"),
            participation("participation-3", "campaign-groupbuy-01", "拼团裂变脚手架", "王五", "137****7000", "美团团购", "order-1003", "已退款", 39_900L, 34_900L, "核对退单恢复与客户回访。")
        );
    }

    private static YyCampaignParticipationScaffoldVo participation(
        String id,
        String campaignId,
        String campaignName,
        String customerName,
        String mobile,
        String channel,
        String orderId,
        String stage,
        Long payableAmountCent,
        Long finalAmountCent,
        String nextAction
    ) {
        YyCampaignParticipationScaffoldVo vo = new YyCampaignParticipationScaffoldVo();
        vo.setParticipationId(id);
        vo.setCampaignId(campaignId);
        vo.setCampaignName(campaignName);
        vo.setCustomerName(customerName);
        vo.setCustomerMobile(mobile);
        vo.setChannelLabel(channel);
        vo.setOrderId(orderId);
        vo.setStage(stage);
        vo.setPayableAmountCent(payableAmountCent);
        vo.setFinalAmountCent(finalAmountCent);
        vo.setNextAction(nextAction);
        return vo;
    }
}
