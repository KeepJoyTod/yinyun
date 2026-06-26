package org.dromara.yy.service;

import org.dromara.yy.domain.bo.YyCompositePaymentCreateBo;
import org.dromara.yy.domain.bo.YyEntitlementReservationCreateBo;
import org.dromara.yy.domain.bo.YyMemberWithdrawCreateBo;
import org.dromara.yy.domain.bo.YyStoredValueConsumeCreateBo;
import org.dromara.yy.domain.bo.YyTransactionSafetyActionBo;
import org.dromara.yy.domain.bo.YyTransactionSafetyQueryBo;
import org.dromara.yy.domain.vo.YyCompositePaymentOrderVo;
import org.dromara.yy.domain.vo.YyEntitlementReservationVo;
import org.dromara.yy.domain.vo.YyMemberWithdrawOrderVo;
import org.dromara.yy.domain.vo.YyStoredValueConsumeOrderVo;

import java.util.List;

public interface IYyTransactionSafetyService {

    List<YyEntitlementReservationVo> listEntitlementReservations(YyTransactionSafetyQueryBo bo);

    YyEntitlementReservationVo createEntitlementReservation(YyEntitlementReservationCreateBo bo);

    YyEntitlementReservationVo releaseEntitlementReservation(Long id, YyTransactionSafetyActionBo bo);

    YyEntitlementReservationVo fulfillEntitlementReservation(Long id, YyTransactionSafetyActionBo bo);

    List<YyEntitlementReservationVo> releaseExpiredEntitlementReservations(YyTransactionSafetyActionBo bo);

    List<YyCompositePaymentOrderVo> listCompositePayments(YyTransactionSafetyQueryBo bo);

    YyCompositePaymentOrderVo createCompositePayment(YyCompositePaymentCreateBo bo);

    YyCompositePaymentOrderVo confirmCompositePayment(Long id, YyTransactionSafetyActionBo bo);

    YyCompositePaymentOrderVo failCompositePayment(Long id, YyTransactionSafetyActionBo bo);

    List<YyStoredValueConsumeOrderVo> listStoredValueConsumes(YyTransactionSafetyQueryBo bo);

    YyStoredValueConsumeOrderVo createStoredValueConsume(YyStoredValueConsumeCreateBo bo);

    YyStoredValueConsumeOrderVo confirmStoredValueConsume(Long id, YyTransactionSafetyActionBo bo);

    YyStoredValueConsumeOrderVo reverseStoredValueConsume(Long id, YyTransactionSafetyActionBo bo);

    List<YyMemberWithdrawOrderVo> listMemberWithdrawOrders(YyTransactionSafetyQueryBo bo);

    YyMemberWithdrawOrderVo createMemberWithdrawOrder(YyMemberWithdrawCreateBo bo);

    YyMemberWithdrawOrderVo markWithdrawPaid(Long id, YyTransactionSafetyActionBo bo);
}
