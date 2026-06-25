package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.YyCampaign;
import org.dromara.yy.domain.YyCampaignParticipation;
import org.dromara.yy.domain.YyCustomer;
import org.dromara.yy.domain.bo.YyCampaignParticipationBo;
import org.dromara.yy.domain.vo.YyCampaignParticipationScaffoldVo;
import org.dromara.yy.domain.vo.YyMarketingParticipationRowVo;
import org.dromara.yy.mapper.YyCampaignMapper;
import org.dromara.yy.mapper.YyCampaignParticipationMapper;
import org.dromara.yy.mapper.YyCustomerMapper;
import org.dromara.yy.service.IYyCampaignParticipationService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class YyCampaignParticipationServiceImpl implements IYyCampaignParticipationService {

    private final YyCampaignParticipationMapper participationMapper;
    private final YyCampaignMapper campaignMapper;
    private final YyCustomerMapper customerMapper;

    @Override
    public List<YyCampaignParticipationScaffoldVo> listScaffold() {
        return queryPageList(new YyCampaignParticipationBo(), null).getRows().stream().map(item -> {
            YyCampaignParticipationScaffoldVo vo = new YyCampaignParticipationScaffoldVo();
            vo.setParticipationId(String.valueOf(item.getParticipationId()));
            vo.setCampaignId(String.valueOf(item.getCampaignId()));
            vo.setCampaignName(item.getCampaignName());
            vo.setCustomerName(item.getCustomerName());
            vo.setCustomerMobile("");
            vo.setChannelLabel(item.getParticipationStatus());
            vo.setOrderId(item.getOrderId() == null ? null : String.valueOf(item.getOrderId()));
            vo.setStage(item.getConversionStatus());
            vo.setPayableAmountCent(item.getPayableAmountCent());
            vo.setFinalAmountCent(item.getFinalAmountCent());
            vo.setNextAction(StringUtils.defaultIfBlank(item.getInvalidReason(), "继续跟进转化与退款状态"));
            return vo;
        }).toList();
    }

    @Override
    public TableDataInfo<YyMarketingParticipationRowVo> queryPageList(YyCampaignParticipationBo bo, PageQuery pageQuery) {
        Map<Long, YyCampaign> campaigns = campaignMapper.selectList(Wrappers.lambdaQuery(YyCampaign.class)).stream()
            .collect(Collectors.toMap(YyCampaign::getId, item -> item, (left, right) -> left));
        Map<Long, YyCustomer> customers = customerMapper.selectList(Wrappers.lambdaQuery(YyCustomer.class)).stream()
            .collect(Collectors.toMap(YyCustomer::getId, item -> item, (left, right) -> left));
        List<YyMarketingParticipationRowVo> list = participationMapper.selectList(Wrappers.lambdaQuery(YyCampaignParticipation.class)
                .eq(bo != null && bo.getCampaignId() != null, YyCampaignParticipation::getCampaignId, bo.getCampaignId())
                .eq(bo != null && StringUtils.isNotBlank(bo.getParticipationStatus()), YyCampaignParticipation::getParticipationStatus, bo.getParticipationStatus())
                .eq(bo != null && StringUtils.isNotBlank(bo.getConversionStatus()), YyCampaignParticipation::getConversionStatus, bo.getConversionStatus())
                .eq(bo != null && StringUtils.isNotBlank(bo.getRefundStatus()), YyCampaignParticipation::getRefundStatus, bo.getRefundStatus())
                .eq(bo != null && bo.getOrderId() != null, YyCampaignParticipation::getOrderId, bo.getOrderId())
                .orderByDesc(YyCampaignParticipation::getParticipatedAt)
                .orderByDesc(YyCampaignParticipation::getId))
            .stream()
            .map(item -> {
                YyMarketingParticipationRowVo vo = new YyMarketingParticipationRowVo();
                YyCampaign campaign = campaigns.get(item.getCampaignId());
                YyCustomer customer = customers.get(item.getCustomerId());
                vo.setParticipationId(item.getId());
                vo.setCampaignId(item.getCampaignId());
                vo.setCampaignName(campaign == null ? "" : campaign.getCampaignName());
                vo.setCustomerId(item.getCustomerId());
                vo.setCustomerName(customer == null ? "" : customer.getCustomerName());
                vo.setOrderId(item.getOrderId());
                vo.setParticipationStatus(item.getParticipationStatus());
                vo.setConversionStatus(item.getConversionStatus());
                vo.setRefundStatus(item.getRefundStatus());
                vo.setInvalidReason(item.getInvalidReason());
                vo.setParticipatedAt(item.getParticipatedAt());
                vo.setPayableAmountCent(item.getPayableAmountCent());
                vo.setFinalAmountCent(item.getFinalAmountCent());
                return vo;
            })
            .filter(item -> bo == null || StringUtils.isBlank(bo.getCustomerName()) || StringUtils.contains(item.getCustomerName(), bo.getCustomerName()))
            .toList();
        return pageQuery == null ? TableDataInfo.build(list) : TableDataInfo.build(list, pageQuery.build());
    }
}
