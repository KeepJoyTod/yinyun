package org.dromara.yy.service;

import java.util.Map;

/**
 * 微信支付成功入口服务。
 */
public interface IYyWechatPaymentNotifyService {

    Map<String, Object> handleNotify(String payload, Map<String, String> headers, String queryString);
}
