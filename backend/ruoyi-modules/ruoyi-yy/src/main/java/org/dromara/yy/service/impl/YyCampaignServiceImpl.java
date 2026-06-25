package org.dromara.yy.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.collection.CollUtil;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.YyCampaign;
import org.dromara.yy.domain.YyCampaignParticipation;
import org.dromara.yy.domain.YyCampaignProduct;
import org.dromara.yy.domain.YyCouponInstance;
import org.dromara.yy.domain.YyCouponTemplate;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.YyProduct;
import org.dromara.yy.domain.YyStore;
import org.dromara.yy.domain.bo.YyCampaignBo;
import org.dromara.yy.domain.bo.YyCampaignProductBindBo;
import org.dromara.yy.domain.vo.YyCampaignScaffoldItemVo;
import org.dromara.yy.domain.vo.YyCampaignScaffoldVo;
import org.dromara.yy.domain.vo.YyMarketingCampaignVo;
import org.dromara.yy.domain.vo.YyMarketingChannelSummaryVo;
import org.dromara.yy.domain.vo.YyMarketingDashboardMetricVo;
import org.dromara.yy.domain.vo.YyMarketingDashboardVo;
import org.dromara.yy.mapper.YyCampaignMapper;
import org.dromara.yy.mapper.YyCampaignParticipationMapper;
import org.dromara.yy.mapper.YyCampaignProductMapper;
import org.dromara.yy.mapper.YyCouponInstanceMapper;
import org.dromara.yy.mapper.YyCouponTemplateMapper;
import org.dromara.yy.mapper.YyOrderMapper;
import org.dromara.yy.mapper.YyProductMapper;
import org.dromara.yy.mapper.YyStoreMapper;
import org.dromara.yy.service.IYyCampaignService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class YyCampaignServiceImpl implements IYyCampaignService {

    private final YyCampaignMapper campaignMapper;
    private final YyCampaignProductMapper campaignProductMapper;
    private final YyCampaignParticipationMapper campaignParticipationMapper;
    private final YyCouponTemplateMapper couponTemplateMapper;
    private final YyCouponInstanceMapper couponInstanceMapper;
    private final YyOrderMapper orderMapper;
    private final YyStoreMapper storeMapper;
    private final YyProductMapper productMapper;

    @Override
    public YyMarketingDashboardVo getMarketingDashboard() {
        List<YyCampaign> campaigns = campaignMapper.selectList(Wrappers.lambdaQuery(YyCampaign.class));
        List<YyCouponTemplate> templates = couponTemplateMapper.selectList(Wrappers.lambdaQuery(YyCouponTemplate.class));
        List<YyCouponInstance> instances = couponInstanceMapper.selectList(Wrappers.lambdaQuery(YyCouponInstance.class));
        List<YyCampaignParticipation> participations = campaignParticipationMapper.selectList(Wrappers.lambdaQuery(YyCampaignParticipation.class));
        List<YyOrder> orders = orderMapper.selectList(Wrappers.lambdaQuery(YyOrder.class)
            .orderByDesc(YyOrder::getOrderTime)
            .last("limit 200"));

        YyMarketingDashboardVo dashboard = new YyMarketingDashboardVo();
        dashboard.setStatus("ready");
        dashboard.setBoundary("营销中心已读取真实券模板、活动、券实例和活动订单聚合；yy_order 仍是唯一订单账本。");
        dashboard.getMetrics().add(metric("campaignCount", "活动总数", String.valueOf(campaigns.size()), "已创建的营销活动数量"));
        dashboard.getMetrics().add(metric("couponTemplateCount", "券模板总数", String.valueOf(templates.size()), "已创建的优惠券模板数量"));
        dashboard.getMetrics().add(metric("issuedCouponCount", "已发券实例", String.valueOf(instances.size()), "发券后生成的真实券实例数量"));
        dashboard.getMetrics().add(metric("participationCount", "活动参与记录", String.valueOf(participations.size()), "真实活动参与账本记录数"));
        dashboard.getChannels().addAll(groupOrdersBySource(orders));
        return dashboard;
    }

    @Override
    public YyCampaignScaffoldVo getCampaignScaffold() {
        YyCampaignScaffoldVo scaffold = new YyCampaignScaffoldVo();
        scaffold.setStatus("ready");
        scaffold.setBoundary("活动脚手架仅保留给 demoMode 与回归对照；真实模式请改用 /yy/campaign/list。");
        queryPageList(new YyCampaignBo(), null).getRows().forEach(item -> {
            YyCampaignScaffoldItemVo vo = new YyCampaignScaffoldItemVo();
            vo.setCampaignId(String.valueOf(item.getCampaignId()));
            vo.setCampaignName(item.getCampaignName());
            vo.setCampaignType(item.getCampaignType());
            vo.setStatus(item.getStatus());
            vo.setStoreScopeLabel(item.getStoreScopeLabel());
            vo.setProductScopeLabel(item.getProductScopeLabel());
            vo.setTimeRangeLabel(item.getTimeRangeLabel());
            vo.setParticipantCount(item.getParticipantCount());
            vo.setOrderCount(item.getOrderCount());
            vo.setPaidAmountCent(item.getPaidAmountCent());
            scaffold.getCampaigns().add(vo);
        });
        scaffold.getSources().addAll(getMarketingDashboard().getChannels());
        return scaffold;
    }

    @Override
    public TableDataInfo<YyMarketingCampaignVo> queryPageList(YyCampaignBo bo, PageQuery pageQuery) {
        List<YyMarketingCampaignVo> list = campaignMapper.selectList(Wrappers.lambdaQuery(YyCampaign.class)
                .like(StringUtils.isNotBlank(bo == null ? null : bo.getCampaignName()), YyCampaign::getCampaignName, bo.getCampaignName())
                .eq(StringUtils.isNotBlank(bo == null ? null : bo.getCampaignType()), YyCampaign::getCampaignType, bo.getCampaignType())
                .eq(StringUtils.isNotBlank(bo == null ? null : bo.getStatus()), YyCampaign::getStatus, bo.getStatus())
                .orderByDesc(YyCampaign::getUpdateTime)
                .orderByDesc(YyCampaign::getId))
            .stream()
            .map(this::toCampaignVo)
            .filter(item -> bo == null || bo.getQueryStoreId() == null || item.getStoreIds().contains(bo.getQueryStoreId()))
            .toList();
        return pageQuery == null ? TableDataInfo.build(list) : TableDataInfo.build(list, pageQuery.build());
    }

    @Override
    public Boolean insertByBo(YyCampaignBo bo) {
        YyCampaign entity = BeanUtil.toBean(bo, YyCampaign.class);
        fillCampaignEntity(entity, bo);
        validCampaign(entity, bo);
        boolean inserted = campaignMapper.insert(entity) > 0;
        if (inserted) {
            replaceCampaignProducts(entity.getId(), bo.getProductIds());
        }
        return inserted;
    }

    @Override
    public Boolean updateByBo(YyCampaignBo bo) {
        YyCampaign existing = requireCampaign(bo.getId());
        BeanUtil.copyProperties(bo, existing, "id", "tenantId", "createBy", "createTime");
        fillCampaignEntity(existing, bo);
        validCampaign(existing, bo);
        boolean updated = campaignMapper.updateById(existing) > 0;
        if (updated && bo.getProductIds() != null) {
            replaceCampaignProducts(existing.getId(), bo.getProductIds());
        }
        return updated;
    }

    @Override
    public Boolean online(Long campaignId) {
        YyCampaign entity = requireCampaign(campaignId);
        entity.setStatus("ONLINE");
        return campaignMapper.updateById(entity) > 0;
    }

    @Override
    public Boolean offline(Long campaignId) {
        YyCampaign entity = requireCampaign(campaignId);
        entity.setStatus("OFFLINE");
        return campaignMapper.updateById(entity) > 0;
    }

    @Override
    public Boolean bindProducts(Long campaignId, YyCampaignProductBindBo bo) {
        requireCampaign(campaignId);
        replaceCampaignProducts(campaignId, bo.getProductIds());
        return true;
    }

    private YyMarketingCampaignVo toCampaignVo(YyCampaign entity) {
        List<Long> storeIds = parseScope(entity.getStoreScope());
        List<YyCampaignProduct> campaignProducts = campaignProductMapper.selectList(Wrappers.lambdaQuery(YyCampaignProduct.class)
            .eq(YyCampaignProduct::getCampaignId, entity.getId()));
        List<Long> productIds = campaignProducts.stream()
            .map(YyCampaignProduct::getProductId)
            .filter(Objects::nonNull)
            .toList();
        Map<Long, String> storeNames = storeMapper.selectByIds(storeIds).stream()
            .collect(Collectors.toMap(YyStore::getId, YyStore::getStoreName, (left, right) -> left));
        Map<Long, String> productNames = productMapper.selectByIds(productIds).stream()
            .collect(Collectors.toMap(YyProduct::getId, YyProduct::getProductName, (left, right) -> left));
        List<YyCampaignParticipation> participations = campaignParticipationMapper.selectList(Wrappers.lambdaQuery(YyCampaignParticipation.class)
            .eq(YyCampaignParticipation::getCampaignId, entity.getId()));
        int participantCount = participations.size();
        int orderCount = (int) participations.stream().map(YyCampaignParticipation::getOrderId).filter(Objects::nonNull).distinct().count();
        long paidAmountCent = participations.stream().map(YyCampaignParticipation::getFinalAmountCent).filter(Objects::nonNull).mapToLong(Long::longValue).sum();
        YyMarketingCampaignVo vo = new YyMarketingCampaignVo();
        vo.setCampaignId(entity.getId());
        vo.setCampaignName(entity.getCampaignName());
        vo.setCampaignType(entity.getCampaignType());
        vo.setStatus(entity.getStatus());
        vo.setStoreIds(storeIds);
        vo.setProductIds(productIds);
        vo.setStoreScopeLabel(joinScopeLabel(storeIds, storeNames, "全部门店"));
        vo.setProductScopeLabel(joinScopeLabel(productIds, productNames, "全部商品"));
        vo.setStartAt(entity.getTimeRangeStart());
        vo.setEndAt(entity.getTimeRangeEnd());
        vo.setTimeRangeLabel(StringUtils.defaultString(entity.getTimeRangeStart()) + " ~ " + StringUtils.defaultString(entity.getTimeRangeEnd()));
        vo.setParticipantCount(participantCount);
        vo.setOrderCount(orderCount);
        vo.setPaidAmountCent(paidAmountCent);
        vo.setRuleSummary(entity.getRuleSummary());
        return vo;
    }

    private void replaceCampaignProducts(Long campaignId, List<Long> productIds) {
        campaignProductMapper.delete(Wrappers.lambdaQuery(YyCampaignProduct.class).eq(YyCampaignProduct::getCampaignId, campaignId));
        if (CollUtil.isEmpty(productIds)) {
            return;
        }
        for (Long productId : productIds) {
            YyCampaignProduct product = new YyCampaignProduct();
            product.setCampaignId(campaignId);
            product.setProductId(productId);
            product.setSpecialPriceCent(0L);
            product.setProductScopeSnapshot(String.valueOf(productId));
            campaignProductMapper.insert(product);
        }
    }

    private void fillCampaignEntity(YyCampaign entity, YyCampaignBo bo) {
        entity.setCampaignCode(entity.getId() == null ? "CMP-" + System.currentTimeMillis() : StringUtils.defaultIfBlank(entity.getCampaignCode(), "CMP-" + entity.getId()));
        entity.setStoreId(CollUtil.isEmpty(bo.getStoreIds()) ? null : bo.getStoreIds().get(0));
        entity.setStoreScope(joinScope(bo.getStoreIds()));
        entity.setTimeRangeStart(bo.getStartAt());
        entity.setTimeRangeEnd(bo.getEndAt());
        entity.setRuleSummary(StringUtils.defaultString(bo.getRuleSummary()));
        entity.setStatus(StringUtils.defaultIfBlank(bo.getStatus(), "DRAFT"));
    }

    private void validCampaign(YyCampaign entity, YyCampaignBo bo) {
        if (CollUtil.isEmpty(bo.getStoreIds())) {
            throw new ServiceException("活动至少选择一个门店");
        }
        if (StringUtils.isBlank(entity.getTimeRangeStart()) || StringUtils.isBlank(entity.getTimeRangeEnd())) {
            throw new ServiceException("活动开始和结束时间不能为空");
        }
    }

    private YyCampaign requireCampaign(Long id) {
        YyCampaign campaign = campaignMapper.selectById(id);
        if (campaign == null) {
            throw new ServiceException("活动不存在");
        }
        return campaign;
    }

    private static List<YyMarketingChannelSummaryVo> groupOrdersBySource(List<YyOrder> orders) {
        Map<String, List<YyOrder>> grouped = orders.stream()
            .collect(Collectors.groupingBy(item -> StringUtils.defaultIfBlank(item.getSource(), "UNKNOWN"), LinkedHashMap::new, Collectors.toList()));
        List<YyMarketingChannelSummaryVo> rows = new ArrayList<>();
        grouped.forEach((source, items) -> {
            YyMarketingChannelSummaryVo vo = new YyMarketingChannelSummaryVo();
            vo.setSourceLabel(source);
            vo.setOrderCount(items.size());
            vo.setPaidOrderCount((int) items.stream().filter(item -> defaultLong(item.getPaidAmountCent()) > 0L).count());
            vo.setPendingCount((int) items.stream().filter(item -> defaultLong(item.getPaidAmountCent()) <= 0L).count());
            vo.setPaidAmountCent(items.stream().map(YyOrder::getPaidAmountCent).filter(Objects::nonNull).mapToLong(Long::longValue).sum());
            rows.add(vo);
        });
        return rows;
    }

    private static YyMarketingDashboardMetricVo metric(String code, String label, String value, String hint) {
        YyMarketingDashboardMetricVo vo = new YyMarketingDashboardMetricVo();
        vo.setMetricCode(code);
        vo.setLabel(label);
        vo.setValue(value);
        vo.setHint(hint);
        return vo;
    }

    private static String joinScope(List<Long> ids) {
        return ids == null ? "" : ids.stream().filter(Objects::nonNull).map(String::valueOf).collect(Collectors.joining(","));
    }

    private static List<Long> parseScope(String scope) {
        if (StringUtils.isBlank(scope)) return List.of();
        return Arrays.stream(scope.split(","))
            .map(String::trim)
            .filter(StringUtils::isNotBlank)
            .map(Long::valueOf)
            .toList();
    }

    private static String joinScopeLabel(List<Long> ids, Map<Long, String> names, String emptyLabel) {
        if (CollUtil.isEmpty(ids)) return emptyLabel;
        return ids.stream().map(id -> names.getOrDefault(id, String.valueOf(id))).collect(Collectors.joining("、"));
    }

    private static long defaultLong(Long value) {
        return value == null ? 0L : value;
    }
}
