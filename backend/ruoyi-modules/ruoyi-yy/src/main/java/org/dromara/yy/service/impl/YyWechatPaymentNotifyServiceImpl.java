package org.dromara.yy.service.impl;

import lombok.RequiredArgsConstructor;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.YyPaymentRecord;
import org.dromara.yy.domain.bo.WechatPaymentNotifyPayload;
import org.dromara.yy.mapper.YyPaymentRecordMapper;
import org.dromara.yy.service.IYyPaymentService;
import org.dromara.yy.service.IYyWechatPaymentNotifyService;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.LinkedHashMap;
import java.util.Map;

import static com.baomidou.mybatisplus.core.toolkit.Wrappers.lambdaQuery;

/**
 * 规范化微信支付成功回调处理。
 */
@RequiredArgsConstructor
@Service
public class YyWechatPaymentNotifyServiceImpl implements IYyWechatPaymentNotifyService {

    private static final String PROVIDER_WECHAT_MINI_APP = "WECHAT_MINI_APP";

    private final IYyPaymentService paymentService;
    private final YyPaymentRecordMapper paymentRecordMapper;
    private final YyWechatPaymentNotifySignaturePolicy signaturePolicy;
    private final YyWechatPaymentNotifyPayloadParser payloadParser;

    @Override
    public Map<String, Object> handleNotify(String payload, Map<String, String> headers, String queryString) {
        try {
            YyWechatPaymentNotifySignaturePolicy.SignatureCheck signatureCheck = signaturePolicy.verify(headers, queryString, payload);
            if (!signatureCheck.valid()) {
                return fail(signatureCheck.message());
            }
            WechatPaymentNotifyPayload notifyPayload = payloadParser.parse(payload);
            if (!"SUCCESS".equalsIgnoreCase(StringUtils.trimToEmpty(notifyPayload.getTradeState()))) {
                return fail("UNSUPPORTED_TRADE_STATE");
            }
            YyPaymentRecord paymentRecord = requirePaymentRecord(notifyPayload.getOutTradeNo());
            IYyPaymentService.PaymentMarkPaidResult result = paymentService.markPaid(
                new IYyPaymentService.PaymentMarkPaidCommand(
                    paymentRecord.getOrderId(),
                    paymentRecord.getTenantId(),
                    paymentRecord.getStoreId(),
                    paymentRecord.getChannelType(),
                    PROVIDER_WECHAT_MINI_APP,
                    notifyPayload.getOutTradeNo(),
                    notifyPayload.getPlatformOrderId(),
                    notifyPayload.getTransactionId(),
                    notifyPayload.getAmountCent(),
                    notifyPayload.getPaidAmountCent(),
                    firstNonNull(notifyPayload.getPaidTime(), new Date()),
                    new Date(),
                    notifyPayload.getRawPayload(),
                    "WECHAT_NOTIFY",
                    null
                ));
            return ok(result.alreadyProcessed() ? "OK" : "OK");
        } catch (ServiceException ex) {
            return fail(ex.getMessage());
        } catch (IllegalArgumentException ex) {
            return fail(ex.getMessage());
        }
    }

    private YyPaymentRecord requirePaymentRecord(String outTradeNo) {
        YyPaymentRecord record = paymentRecordMapper.selectOne(lambdaQuery(YyPaymentRecord.class)
            .eq(YyPaymentRecord::getOutTradeNo, StringUtils.trimToEmpty(outTradeNo))
            .orderByDesc(YyPaymentRecord::getId)
            .last("limit 1"));
        if (record == null) {
            throw new ServiceException("支付流水不存在");
        }
        return record;
    }

    private Map<String, Object> ok(String message) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("code", "SUCCESS");
        result.put("message", StringUtils.defaultIfBlank(message, "OK"));
        return result;
    }

    private Map<String, Object> fail(String message) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("code", "FAIL");
        result.put("message", StringUtils.defaultIfBlank(message, "FAIL"));
        return result;
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
