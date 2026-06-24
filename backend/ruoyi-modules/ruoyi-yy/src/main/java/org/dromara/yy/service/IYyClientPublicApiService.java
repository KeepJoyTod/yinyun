package org.dromara.yy.service;

import org.dromara.yy.domain.bo.ClientCustomerBindPhoneBo;
import org.dromara.yy.domain.bo.ClientCustomerLoginBo;
import org.dromara.yy.domain.bo.ClientCustomerOrderCancelBo;
import org.dromara.yy.domain.bo.ClientCustomerOrderCreateBo;
import org.dromara.yy.domain.bo.ClientCustomerOrderRescheduleBo;

import java.util.List;
import java.util.Map;

/**
 * 客户端公开/会员 API 服务。
 */
public interface IYyClientPublicApiService {

    Map<String, Object> brand(String brandCode);

    Map<String, Object> home(String brandCode);

    List<Map<String, Object>> stores(String brandCode, String keyword);

    Map<String, Object> storeProducts(Long storeId);

    Map<String, Object> productDetail(Long productId);

    List<Map<String, Object>> storeSlots(Long storeId, String date, Long productId);

    Map<String, Object> customerLogin(ClientCustomerLoginBo bo);

    Map<String, Object> bindPhone(String authorization, ClientCustomerBindPhoneBo bo);

    Map<String, Object> customerProfile(String authorization);

    Map<String, Object> orderSummary(String authorization);

    Map<String, Object> customerOrders(String authorization, Integer page, Integer size, String status);

    Map<String, Object> customerOrder(String authorization, Long orderId);

    Map<String, Object> createCustomerOrder(String authorization, ClientCustomerOrderCreateBo bo);

    Map<String, Object> payCustomerOrder(String authorization, Long orderId);

    Map<String, Object> cancelCustomerOrder(String authorization, Long orderId, ClientCustomerOrderCancelBo bo);

    Map<String, Object> rescheduleCustomerOrder(String authorization, Long orderId, ClientCustomerOrderRescheduleBo bo);
}
