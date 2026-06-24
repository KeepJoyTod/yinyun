package org.dromara.yy.service.marketing.policy;

import org.dromara.common.core.exception.ServiceException;
import org.dromara.yy.domain.bo.YyPromotionTrialBo;
import org.dromara.yy.domain.vo.YyPromotionTrialCandidateVo;
import org.dromara.yy.domain.vo.YyPromotionTrialResultVo;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class PromotionPriorityPolicy {

    private final PromotionRefundRestorePolicy refundRestorePolicy = new PromotionRefundRestorePolicy();

    public YyPromotionTrialResultVo evaluate(YyPromotionTrialBo bo) {
        long originalAmountCent = bo == null || bo.getOriginalAmountCent() == null ? 0L : bo.getOriginalAmountCent();
        if (originalAmountCent <= 0L) {
            throw new ServiceException("原价异常，无法完成优惠试算");
        }

        String sourceText = ((bo == null ? "" : bo.getOrderSource()) + " " + (bo == null ? "" : bo.getProductName())).trim();
        boolean voucherEligible = sourceText.contains("兑换");
        boolean campaignEligible = containsAny(sourceText, "抖音", "美团", "活动", "拼团", "秒杀", "砍价", "分享");
        boolean couponEligible = originalAmountCent >= 10_000L;
        boolean couponCodeEligible = originalAmountCent >= 8_000L;
        boolean cardEligible = containsAny(bo == null ? "" : bo.getCustomerLevel(), "VIP", "高级") || originalAmountCent >= 30_000L;

        List<YyPromotionTrialCandidateVo> candidates = new ArrayList<>();
        candidates.add(candidate("redeem-voucher", "REDEEM_VOUCHER", "兑换券抵扣", 1, originalAmountCent, originalAmountCent, voucherEligible, "仅适用于兑换类商品或入口"));
        candidates.add(candidate("campaign-best-price", "CAMPAIGN", "活动最优价", 2, originalAmountCent, Math.min(5_000L, Math.round(originalAmountCent * 0.2d)), campaignEligible, "当前订单未命中活动类入口"));
        candidates.add(candidate("coupon-template", "COUPON", "优惠券", 3, originalAmountCent, 3_000L, couponEligible, "满 100 元可用"));
        candidates.add(candidate("coupon-code", "COUPON_CODE", "优惠码", 3, originalAmountCent, 2_000L, couponCodeEligible, "满 80 元可用"));
        candidates.add(candidate("card-right", "CARD_RIGHT", "次卡/共享次卡/卡项权益", 4, originalAmountCent, 5_000L, cardEligible, "仅高等级或高客单订单示意"));

        YyPromotionTrialCandidateVo applied = candidates.stream()
            .filter(candidate -> Boolean.TRUE.equals(candidate.getApplicable()))
            .min(Comparator.comparing(YyPromotionTrialCandidateVo::getPriority).thenComparing(YyPromotionTrialCandidateVo::getDiscountAmountCent, Comparator.reverseOrder()))
            .orElse(null);

        YyPromotionTrialResultVo result = new YyPromotionTrialResultVo();
        result.setOriginalAmountCent(originalAmountCent);
        result.setRestorePolicy(refundRestorePolicy.resolveRestorePolicy());
        if (applied == null) {
            result.setStatus("blocked");
            result.setFinalAmountCent(originalAmountCent);
            result.setDiscountAmountCent(0L);
            candidates.stream()
                .map(YyPromotionTrialCandidateVo::getReason)
                .filter(reason -> reason != null && !reason.isBlank())
                .forEach(result.getBlockedReasons()::add);
            result.setCandidates(candidates);
            return result;
        }

        for (YyPromotionTrialCandidateVo candidate : candidates) {
          if (candidate == applied) {
              continue;
          }
          if (Boolean.TRUE.equals(candidate.getApplicable()) && candidate.getPriority() >= applied.getPriority()) {
              candidate.setApplicable(false);
              candidate.setConflictSource(applied.getTitle());
              candidate.setReason("与 " + applied.getTitle() + " 互斥，按固定优先级未命中。");
          }
          if (!Boolean.TRUE.equals(candidate.getApplicable()) && candidate.getReason() != null && !candidate.getReason().isBlank()) {
              result.getBlockedReasons().add(candidate.getReason());
          }
        }

        result.setStatus("eligible");
        result.setAppliedRuleCode(applied.getCandidateType());
        result.setFinalAmountCent(applied.getFinalAmountCent());
        result.setDiscountAmountCent(applied.getDiscountAmountCent());
        result.setConflictSource(applied.getTitle());
        result.setCandidates(candidates);
        return result;
    }

    private static YyPromotionTrialCandidateVo candidate(
        String candidateId,
        String candidateType,
        String title,
        Integer priority,
        Long originalAmountCent,
        Long discountAmountCent,
        boolean applicable,
        String unavailableReason
    ) {
        YyPromotionTrialCandidateVo candidate = new YyPromotionTrialCandidateVo();
        candidate.setCandidateId(candidateId);
        candidate.setCandidateType(candidateType);
        candidate.setTitle(title);
        candidate.setApplicable(applicable);
        candidate.setPriority(priority);
        candidate.setDiscountAmountCent(applicable ? discountAmountCent : 0L);
        candidate.setFinalAmountCent(applicable ? Math.max(0L, originalAmountCent - discountAmountCent) : originalAmountCent);
        if (!applicable) {
            candidate.setReason(unavailableReason);
        }
        return candidate;
    }

    private static boolean containsAny(String text, String... items) {
        if (text == null || text.isBlank()) {
            return false;
        }
        for (String item : items) {
            if (text.contains(item)) {
                return true;
            }
        }
        return false;
    }
}
