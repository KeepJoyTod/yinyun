package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.toolkit.IdWorker;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.YyPaymentRecord;
import org.dromara.yy.domain.vo.BookingSlotInventoryDecision;
import org.dromara.yy.mapper.YyOrderMapper;
import org.dromara.yy.mapper.YyPaymentRecordMapper;
import org.dromara.yy.service.IYyBookingSlotInventoryService;
import org.dromara.yy.service.IYyPaymentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.Map;
import java.util.Objects;

import static org.dromara.yy.service.impl.YyClientOrderPhoneMatcher.matchesClientOrderPhone;

/**
 * 支付闭环核心服务。
 */
@RequiredArgsConstructor
@Service
public class YyPaymentServiceImpl implements IYyPaymentService {

    private static final String PAY_STATUS_PENDING = "PENDING";
    private static final String PAY_STATUS_PAID = "PAID";
    private static final String PROVIDER_WECHAT_MINI_APP = "WECHAT_MINI_APP";
    private static final String PROVIDER_STORE_CONFIRM = "STORE_CONFIRM";

    private final YyPaymentRecordMapper paymentRecordMapper;
    private final YyOrderMapper orderMapper;
    private final IYyBookingSlotInventoryService bookingSlotInventoryService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CustomerPrepayResult createPrepayForCustomerOrder(CustomerPrepayCommand command) {
        if (command == null || command.orderId() == null) {
            throw new ServiceException("订单不能为空");
        }
        YyOrder order = requireEligibleLocalOrder(command.orderId(), command.tenantId(), command.customerPhone());
        String provider = normalizeProvider(command.provider());
        String channelType = YyPaymentOrderPolicy.normalizeChannelType(order);
        String outTradeNo = StringUtils.trimToEmpty(command.outTradeNo());

        if (PAY_STATUS_PAID.equalsIgnoreCase(StringUtils.trimToEmpty(order.getPayStatus()))) {
            YyPaymentRecord latest = findLatestRecord(order.getTenantId(), order.getId(), channelType);
            return toAlreadyPaidPrepayResult(order, provider, latest);
        }

        YyPaymentRecord existingPending = findLatestPendingRecord(order.getTenantId(), order.getId(), channelType, provider, outTradeNo);
        if (existingPending == null) {
            existingPending = new YyPaymentRecord();
            existingPending.setId(IdWorker.getId());
            existingPending.setTenantId(order.getTenantId());
            existingPending.setStoreId(firstNonNull(command.storeId(), order.getStoreId()));
            existingPending.setOrderId(order.getId());
            existingPending.setChannelType(channelType);
            existingPending.setProvider(provider);
            existingPending.setOutTradeNo(resolveOutTradeNo(order.getId(), provider, outTradeNo));
            existingPending.setAmountCent(YyPaymentOrderPolicy.normalizeAmount(order.getTotalAmountCent()));
            existingPending.setPaidAmountCent(0L);
            existingPending.setCurrency("CNY");
            existingPending.setPayStatus(PAY_STATUS_PENDING);
            existingPending.setRefundStatus("");
            existingPending.setRefundAmountCent(0L);
            paymentRecordMapper.insert(existingPending);
        }

        return new CustomerPrepayResult(
            true,
            "",
            String.valueOf(order.getId()),
            order.getOrderNo(),
            YyPaymentOrderPolicy.normalizeAmount(order.getTotalAmountCent()),
            provider,
            existingPending.getOutTradeNo(),
            existingPending.getId(),
            YyPaymentOrderPolicy.normalizePayStatus(order.getPayStatus()),
            Map.of()
        );
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PaymentMarkPaidResult markPaid(PaymentMarkPaidCommand command) {
        if (command == null || StringUtils.isBlank(command.outTradeNo())) {
            throw new ServiceException("支付流水号不能为空");
        }
        String tenantId = normalizedTenantId(command.tenantId());
        String channelType = YyPaymentOrderPolicy.normalizeChannelType(command.channelType());
        YyPaymentRecord paymentRecord = paymentRecordMapper.selectOne(Wrappers.<YyPaymentRecord>lambdaQuery()
            .eq(YyPaymentRecord::getTenantId, tenantId)
            .eq(YyPaymentRecord::getChannelType, channelType)
            .eq(YyPaymentRecord::getOutTradeNo, StringUtils.trim(command.outTradeNo()))
            .orderByDesc(YyPaymentRecord::getId)
            .last("limit 1"));
        if (paymentRecord == null) {
            throw new ServiceException("支付流水不存在");
        }

        YyOrder order = orderMapper.selectById(firstNonNull(command.orderId(), paymentRecord.getOrderId()));
        if (order == null) {
            throw new ServiceException("订单不存在");
        }
        validatePaidEntryOrder(order, tenantId);

        Long paidAmount = resolvePaidAmount(command, paymentRecord, order);
        validateAmount(paymentRecord, order, paidAmount);

        if (PAY_STATUS_PAID.equalsIgnoreCase(StringUtils.trimToEmpty(paymentRecord.getPayStatus()))) {
            return new PaymentMarkPaidResult(true, paymentRecord, order, null);
        }

        Date paidTime = firstNonNull(command.paidTime(), new Date());
        YyPaymentRecord paymentUpdate = new YyPaymentRecord();
        paymentUpdate.setId(paymentRecord.getId());
        paymentUpdate.setPlatformOrderId(StringUtils.trimToEmpty(command.platformOrderId()));
        paymentUpdate.setTransactionId(StringUtils.trimToEmpty(command.transactionId()));
        paymentUpdate.setPaidAmountCent(paidAmount);
        paymentUpdate.setPayStatus(PAY_STATUS_PAID);
        paymentUpdate.setPaidTime(paidTime);
        paymentUpdate.setNotifyTime(firstNonNull(command.notifyTime(), paidTime));
        paymentUpdate.setRawPayload(sanitizePayload(command.rawPayload()));
        paymentUpdate.setRemark(buildPaymentRemark(command));
        paymentRecordMapper.updateById(paymentUpdate);

        YyOrder orderUpdate = new YyOrder();
        orderUpdate.setId(order.getId());
        orderUpdate.setPayStatus(PAY_STATUS_PAID);
        orderUpdate.setPaidAmountCent(paidAmount);
        orderUpdate.setPaidTime(paidTime);
        orderMapper.updateById(orderUpdate);

        paymentRecord.setPlatformOrderId(paymentUpdate.getPlatformOrderId());
        paymentRecord.setTransactionId(paymentUpdate.getTransactionId());
        paymentRecord.setPaidAmountCent(paidAmount);
        paymentRecord.setPayStatus(PAY_STATUS_PAID);
        paymentRecord.setPaidTime(paidTime);
        paymentRecord.setNotifyTime(paymentUpdate.getNotifyTime());
        paymentRecord.setRawPayload(paymentUpdate.getRawPayload());
        paymentRecord.setRemark(paymentUpdate.getRemark());

        order.setPayStatus(PAY_STATUS_PAID);
        order.setPaidAmountCent(paidAmount);
        order.setPaidTime(paidTime);

        BookingSlotInventoryDecision inventoryDecision = bookingSlotInventoryService.confirmPaidOrderSlot(order);
        return new PaymentMarkPaidResult(false, paymentRecord, order, inventoryDecision);
    }

    private YyOrder requireEligibleLocalOrder(Long orderId, String tenantId, String customerPhone) {
        YyOrder order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new ServiceException("订单不存在");
        }
        validatePaidEntryOrder(order, tenantId);
        if (StringUtils.isNotBlank(customerPhone)
            && !matchesClientOrderPhone(customerPhone, StringUtils.trimToEmpty(order.getCustomerPhone()))) {
            throw new ServiceException("无权访问该订单");
        }
        return order;
    }

    private void validatePaidEntryOrder(YyOrder order, String tenantId) {
        YyPaymentOrderPolicy.validateCustomerPayableOrder(order, tenantId);
    }

    private Long resolvePaidAmount(PaymentMarkPaidCommand command, YyPaymentRecord paymentRecord, YyOrder order) {
        Long paidAmount = firstNonNull(command.paidAmountCent(), command.amountCent(), paymentRecord.getAmountCent(), order.getTotalAmountCent(), 0L);
        if (paidAmount == null || paidAmount < 0) {
            throw new ServiceException("支付金额不合法");
        }
        return paidAmount;
    }

    private void validateAmount(YyPaymentRecord paymentRecord, YyOrder order, Long paidAmount) {
        Long recordAmount = YyPaymentOrderPolicy.normalizeAmount(paymentRecord.getAmountCent());
        Long orderAmount = YyPaymentOrderPolicy.normalizeAmount(order.getTotalAmountCent());
        if ((recordAmount > 0 && !Objects.equals(recordAmount, paidAmount))
            || (orderAmount > 0 && !Objects.equals(orderAmount, paidAmount))) {
            throw new ServiceException("支付金额校验失败");
        }
    }

    private YyPaymentRecord findLatestPendingRecord(String tenantId, Long orderId, String channelType, String provider, String outTradeNo) {
        if (StringUtils.isNotBlank(outTradeNo)) {
            YyPaymentRecord explicitRecord = paymentRecordMapper.selectOne(Wrappers.<YyPaymentRecord>lambdaQuery()
                .eq(YyPaymentRecord::getTenantId, tenantId)
                .eq(YyPaymentRecord::getOrderId, orderId)
                .eq(YyPaymentRecord::getChannelType, channelType)
                .eq(YyPaymentRecord::getProvider, provider)
                .eq(YyPaymentRecord::getOutTradeNo, outTradeNo)
                .eq(YyPaymentRecord::getPayStatus, PAY_STATUS_PENDING)
                .orderByDesc(YyPaymentRecord::getId)
                .last("limit 1"));
            if (explicitRecord != null) {
                return explicitRecord;
            }
        }
        return paymentRecordMapper.selectOne(Wrappers.<YyPaymentRecord>lambdaQuery()
            .eq(YyPaymentRecord::getTenantId, tenantId)
            .eq(YyPaymentRecord::getOrderId, orderId)
            .eq(YyPaymentRecord::getChannelType, channelType)
            .eq(YyPaymentRecord::getProvider, provider)
            .eq(YyPaymentRecord::getPayStatus, PAY_STATUS_PENDING)
            .orderByDesc(YyPaymentRecord::getId)
            .last("limit 1"));
    }

    private String resolveOutTradeNo(Long orderId, String provider, String requestedOutTradeNo) {
        if (StringUtils.isNotBlank(requestedOutTradeNo)) {
            return requestedOutTradeNo.trim();
        }
        if (PROVIDER_STORE_CONFIRM.equalsIgnoreCase(provider)) {
            return "STOREPAY-" + orderId + "-" + IdWorker.getId();
        }
        return "YYPAY-" + orderId + "-" + IdWorker.getId();
    }

    private YyPaymentRecord findLatestRecord(String tenantId, Long orderId, String channelType) {
        return paymentRecordMapper.selectOne(Wrappers.<YyPaymentRecord>lambdaQuery()
            .eq(YyPaymentRecord::getTenantId, tenantId)
            .eq(YyPaymentRecord::getOrderId, orderId)
            .eq(YyPaymentRecord::getChannelType, channelType)
            .orderByDesc(YyPaymentRecord::getId)
            .last("limit 1"));
    }

    private CustomerPrepayResult toAlreadyPaidPrepayResult(YyOrder order, String provider, YyPaymentRecord latest) {
        return new CustomerPrepayResult(
            false,
            "订单已支付",
            String.valueOf(order.getId()),
            order.getOrderNo(),
            YyPaymentOrderPolicy.normalizeAmount(order.getTotalAmountCent()),
            provider,
            latest == null ? "" : StringUtils.trimToEmpty(latest.getOutTradeNo()),
            latest == null ? null : latest.getId(),
            PAY_STATUS_PAID,
            Map.of()
        );
    }

    private String buildPaymentRemark(PaymentMarkPaidCommand command) {
        String operatorType = StringUtils.trimToEmpty(command.operatorType());
        Long operatorId = command.operatorId();
        if (StringUtils.isBlank(operatorType) && operatorId == null) {
            return "";
        }
        return "operatorType=" + operatorType + ",operatorId=" + firstNonNull(operatorId, 0L);
    }

    private String sanitizePayload(String rawPayload) {
        return StringUtils.substring(StringUtils.trimToEmpty(rawPayload), 0, 4000);
    }

    private String normalizeProvider(String provider) {
        String normalized = StringUtils.trimToEmpty(provider).toUpperCase();
        return StringUtils.isBlank(normalized) ? PROVIDER_WECHAT_MINI_APP : normalized;
    }

    private String normalizedTenantId(String tenantId) {
        return StringUtils.trimToEmpty(tenantId);
    }

    @SafeVarargs
    private static <T> T firstNonNull(T... values) {
        if (values == null) {
            return null;
        }
        for (T value : values) {
            if (value != null) {
                return value;
            }
        }
        return null;
    }

}
