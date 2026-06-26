package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.YyServiceGroup;
import org.dromara.yy.domain.bo.YyCustomerExperienceP1ReviewDraftBo;
import org.dromara.yy.domain.vo.YyCustomerExperienceP1AssetSummaryVo;
import org.dromara.yy.domain.vo.YyCustomerExperienceP1BookingOptionsVo;
import org.dromara.yy.domain.vo.YyCustomerExperienceP1OrderVerificationVo;
import org.dromara.yy.domain.vo.YyCustomerExperienceP1ReviewDraftResultVo;
import org.dromara.yy.mapper.YyServiceGroupMapper;
import org.dromara.yy.service.IYyClientExperienceP1Service;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@RequiredArgsConstructor
@Service
public class YyClientExperienceP1ServiceImpl implements IYyClientExperienceP1Service {

    private final YyServiceGroupMapper serviceGroupMapper;

    @Override
    public YyCustomerExperienceP1BookingOptionsVo bookingOptions(Long productId, Long storeId) {
        YyCustomerExperienceP1BookingOptionsVo vo = new YyCustomerExperienceP1BookingOptionsVo();
        vo.setStatus("scaffold");
        vo.setServiceGroups(listServiceGroups(storeId));
        vo.setProfileFields(List.of(profileField("gender", "性别", "select"), profileField("customRemark", "自定义资料", "textarea")));
        vo.setEntitlementCandidates(List.of(
            entitlement("coupon-p1-placeholder", "优惠券/兑换券选择待接入", "coupon", "unavailable", "待试算", "商户券账本已落地，消费者下单选择与不可用原因待接入。"),
            entitlement("card-p1-placeholder", "会员卡/次卡权益待核销", "card", "unavailable", "待核销", "会员资产读侧已落地，下单按产品、门店、次数核销待实现。")
        ));
        vo.setAssetSummary(assetSummary());
        vo.setNotices(List.of(
            "P1 只返回消费者体验脚手架，不执行真实权益核销。",
            "支付、退款和权益返还仍归 P0 交易安全闭环。"
        ));
        return vo;
    }

    @Override
    public YyCustomerExperienceP1AssetSummaryVo assetSummary() {
        YyCustomerExperienceP1AssetSummaryVo vo = new YyCustomerExperienceP1AssetSummaryVo();
        vo.setCardCount(0);
        vo.setBenefitCount(0);
        vo.setCouponCount(0);
        vo.setPoints(0);
        vo.setGrowthValue(0);
        vo.setBalanceLabel("¥0.00");
        vo.setStatus("scaffold");
        vo.setEmptyReason("会员资产读侧已在工作台落地，消费者端核销和支付联动待后续接入。");
        return vo;
    }

    @Override
    public YyCustomerExperienceP1OrderVerificationVo orderVerification(String orderId) {
        YyCustomerExperienceP1OrderVerificationVo vo = new YyCustomerExperienceP1OrderVerificationVo();
        vo.setOrderId(orderId);
        vo.setStatus("scaffold");
        vo.setChannel("LOCAL");
        vo.setCanDisplayCode(false);
        vo.setCodeLabel("核销码待接入");
        vo.setReason("后台核销和渠道排障已存在，消费者端展示规则待后续接真实订单状态。");
        vo.setNextAction("到店前请以门店确认信息为准。");
        return vo;
    }

    @Override
    public YyCustomerExperienceP1ReviewDraftResultVo createReviewDraft(YyCustomerExperienceP1ReviewDraftBo bo) {
        YyCustomerExperienceP1ReviewDraftResultVo vo = new YyCustomerExperienceP1ReviewDraftResultVo();
        vo.setStatus("scaffold");
        vo.setMessage("评价提交脚手架已接入，评价表与渠道评价 API 待后续接线。");
        vo.setEvidenceRefs(List.of("docs/product-function-inventory(产品功能清单).md:63"));
        return vo;
    }

    private YyCustomerExperienceP1BookingOptionsVo.ServiceGroupOptionVo serviceGroup() {
        YyCustomerExperienceP1BookingOptionsVo.ServiceGroupOptionVo vo = new YyCustomerExperienceP1BookingOptionsVo.ServiceGroupOptionVo();
        vo.setServiceGroupId("");
        vo.setName("服务组选择待接入");
        vo.setDescription("后台服务组和员工录单已落地，消费者端下单传递 serviceGroupId 待闭环。");
        vo.setCapacityLabel("按排期库存最终校验");
        vo.setStatus("scaffold");
        return vo;
    }

    private List<YyCustomerExperienceP1BookingOptionsVo.ServiceGroupOptionVo> listServiceGroups(Long storeId) {
        if (storeId == null) {
            return List.of();
        }
        return serviceGroupMapper.selectList(Wrappers.<YyServiceGroup>lambdaQuery()
            .eq(YyServiceGroup::getStoreId, storeId)
            .in(YyServiceGroup::getStatus, List.of("0", "OPEN", "ACTIVE"))
            .orderByAsc(YyServiceGroup::getSort)
            .orderByAsc(YyServiceGroup::getId))
            .stream()
            .filter(group -> isActive(group.getStatus()))
            .map(this::serviceGroup)
            .toList();
    }

    private YyCustomerExperienceP1BookingOptionsVo.ServiceGroupOptionVo serviceGroup(YyServiceGroup group) {
        YyCustomerExperienceP1BookingOptionsVo.ServiceGroupOptionVo vo = new YyCustomerExperienceP1BookingOptionsVo.ServiceGroupOptionVo();
        vo.setServiceGroupId(String.valueOf(group.getId()));
        vo.setName(StringUtils.defaultIfBlank(group.getGroupName(), group.getGroupCode()));
        vo.setDescription(StringUtils.defaultString(group.getRemark()));
        vo.setCapacityLabel("capacity=" + (group.getCapacity() == null ? 0 : group.getCapacity())
            + ", duration=" + (group.getDurationMinutes() == null ? 0 : group.getDurationMinutes()) + "min");
        vo.setStatus("building");
        return vo;
    }

    private boolean isActive(String status) {
        return List.of("0", "OPEN", "ACTIVE").contains(StringUtils.trimToEmpty(status).toUpperCase(Locale.ROOT));
    }

    private YyCustomerExperienceP1BookingOptionsVo.ProfileFieldVo profileField(String key, String label, String inputType) {
        YyCustomerExperienceP1BookingOptionsVo.ProfileFieldVo vo = new YyCustomerExperienceP1BookingOptionsVo.ProfileFieldVo();
        vo.setKey(key);
        vo.setLabel(label);
        vo.setRequired(false);
        vo.setInputType(inputType);
        vo.setPlaceholder("预约配置字段接入后展示");
        vo.setOptions("select".equals(inputType) ? List.of("男", "女", "不便透露") : List.of());
        vo.setStatus("scaffold");
        return vo;
    }

    private YyCustomerExperienceP1BookingOptionsVo.EntitlementCandidateVo entitlement(
        String candidateId,
        String title,
        String kind,
        String status,
        String amountLabel,
        String reason
    ) {
        YyCustomerExperienceP1BookingOptionsVo.EntitlementCandidateVo vo = new YyCustomerExperienceP1BookingOptionsVo.EntitlementCandidateVo();
        vo.setCandidateId(candidateId);
        vo.setTitle(title);
        vo.setKind(kind);
        vo.setStatus(status);
        vo.setAmountLabel(amountLabel);
        vo.setReason(reason);
        vo.setActionLabel("查看卡券权益");
        return vo;
    }
}
