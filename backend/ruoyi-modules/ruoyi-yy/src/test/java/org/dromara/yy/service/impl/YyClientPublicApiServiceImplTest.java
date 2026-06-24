package org.dromara.yy.service.impl;

import org.dromara.common.core.exception.ServiceException;
import org.dromara.yy.domain.YyChannelOrderMapping;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.YyPhotoAlbum;
import org.dromara.yy.domain.YyProduct;
import org.dromara.yy.domain.YyStore;
import org.dromara.yy.domain.bo.ClientCustomerBindPhoneBo;
import org.dromara.yy.domain.bo.ClientCustomerLoginBo;
import org.dromara.yy.domain.bo.ClientCustomerOrderCreateBo;
import org.dromara.yy.domain.bo.ClientCustomerOrderRescheduleBo;
import org.dromara.yy.mapper.YyBookingSlotInventoryMapper;
import org.dromara.yy.mapper.YyChannelOrderMappingMapper;
import org.dromara.yy.mapper.YyCustomerMapper;
import org.dromara.yy.mapper.YyOrderMapper;
import org.dromara.yy.mapper.YyPhotoAlbumMapper;
import org.dromara.yy.mapper.YyProductMapper;
import org.dromara.yy.mapper.YyStoreMapper;
import org.dromara.yy.service.IYyBookingSlotInventoryService;
import org.dromara.yy.service.IYyCustomerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyClientPublicApiServiceImplTest {

    private static final String TEST_PHONE = "138" + "0000" + "0000";

    @Mock
    private YyStoreMapper storeMapper;

    @Mock
    private YyProductMapper productMapper;

    @Mock
    private YyBookingSlotInventoryMapper inventoryMapper;

    @Mock
    private YyOrderMapper orderMapper;

    @Mock
    private YyPhotoAlbumMapper photoAlbumMapper;

    @Mock
    private YyChannelOrderMappingMapper channelOrderMappingMapper;

    @Mock
    private YyCustomerMapper customerMapper;

    @Mock
    private IYyCustomerService customerService;

    @Mock
    private IYyBookingSlotInventoryService bookingSlotInventoryService;

    @InjectMocks
    private YyClientPublicApiServiceImpl service;

    @BeforeEach
    void setUpTokenSecret() {
        ReflectionTestUtils.setField(service, "customerTokenSecret", "test-secret-not-default-1234567890abcdef");
    }

    @Test
    void customerTokenShouldRejectDefaultSecretInProduction() {
        ReflectionTestUtils.setField(service, "customerTokenSecret", "yingyue-customer-dev-secret-change-me");
        ClientCustomerLoginBo bo = new ClientCustomerLoginBo();
        bo.setCode("test-login-code");

        ServiceException exception = assertThrows(ServiceException.class, () -> service.customerLogin(bo));

        assertEquals("会员令牌密钥未配置，请设置 yy.client-public.token-secret", exception.getMessage());
    }

    @Test
    void customerTokenShouldRejectBlankSecret() {
        ReflectionTestUtils.setField(service, "customerTokenSecret", "");
        ClientCustomerLoginBo bo = new ClientCustomerLoginBo();
        bo.setCode("test-login-code");

        ServiceException exception = assertThrows(ServiceException.class, () -> service.customerLogin(bo));

        assertEquals("会员令牌密钥未配置，请设置 yy.client-public.token-secret", exception.getMessage());
    }

    @Test
    void storesShouldHideInternalDouyinLifeDefaultStore() {
        YyStore realStore = activeStore(900000000000000100L);
        YyStore defaultStore = internalDefaultStore();
        when(storeMapper.selectList(any())).thenReturn(List.of(realStore, defaultStore));

        List<Map<String, Object>> stores = service.stores("yingyue", "");

        assertEquals(1, stores.size());
        assertEquals(String.valueOf(realStore.getId()), stores.get(0).get("storeId"));
        assertEquals(realStore.getStoreName(), stores.get(0).get("name"));
    }

    @Test
    void storeProductsShouldRejectInternalDouyinLifeDefaultStore() {
        YyStore defaultStore = internalDefaultStore();
        when(storeMapper.selectById(defaultStore.getId())).thenReturn(defaultStore);

        ServiceException exception = assertThrows(ServiceException.class, () -> service.storeProducts(defaultStore.getId()));

        assertEquals("门店不存在或已停用", exception.getMessage());
    }

    @Test
    @SuppressWarnings("unchecked")
    void homeShouldNotCountInternalDefaultStoreProducts() {
        YyStore realStore = activeStore(900000000000000100L);
        YyStore defaultStore = internalDefaultStore();
        YyProduct realProduct = activeProduct(900000000000010100L, realStore.getId());
        YyProduct defaultProduct = activeProduct(900000000000010200L, defaultStore.getId());
        defaultProduct.setProductType("ID_PHOTO");
        when(productMapper.selectList(any())).thenReturn(List.of(realProduct, defaultProduct));
        when(storeMapper.selectList(any())).thenReturn(List.of(realStore, defaultStore));

        Map<String, Object> home = service.home("yingyue");
        List<Map<String, Object>> categories = (List<Map<String, Object>>) home.get("categories");

        assertEquals(1, categories.size());
        assertEquals("portrait", categories.get(0).get("categoryId"));
        assertEquals(1, categories.get(0).get("productCount"));
    }

    @Test
    void productDetailShouldRejectInternalDefaultStoreProduct() {
        YyStore defaultStore = internalDefaultStore();
        YyProduct product = activeProduct(900000000000010200L, defaultStore.getId());
        when(productMapper.selectById(product.getId())).thenReturn(product);
        when(storeMapper.selectById(defaultStore.getId())).thenReturn(defaultStore);

        ServiceException exception = assertThrows(ServiceException.class, () -> service.productDetail(product.getId()));

        assertEquals("门店不存在或已停用", exception.getMessage());
    }

    @Test
    void storeSlotsShouldRejectInternalDouyinLifeDefaultStore() {
        YyStore defaultStore = internalDefaultStore();
        when(storeMapper.selectById(defaultStore.getId())).thenReturn(defaultStore);

        ServiceException exception = assertThrows(ServiceException.class,
            () -> service.storeSlots(defaultStore.getId(), "2026-06-20", null));

        assertEquals("门店不存在或已停用", exception.getMessage());
        verify(inventoryMapper, never()).selectList(any());
    }

    @Test
    void payCustomerOrderShouldRequireBoundPhone() {
        String guestToken = loginTokenWithoutPhone();

        assertThrows(ServiceException.class, () -> service.payCustomerOrder("Bearer " + guestToken, 9001L));

        verify(orderMapper, never()).selectById(any());
    }

    @Test
    void payCustomerOrderShouldReturnPlaceholderWithoutMarkingPaid() {
        String token = boundPhoneToken(TEST_PHONE);
        YyOrder order = localCustomerOrder(9001L);
        when(orderMapper.selectById(9001L)).thenReturn(order);

        Map<String, Object> result = service.payCustomerOrder("Bearer " + token, 9001L);

        assertEquals(false, result.get("paymentReady"));
        assertEquals("", result.get("timeStamp"));
        assertEquals("", result.get("paySign"));
        assertEquals("9001", result.get("orderId"));
        assertEquals("UNPAID", order.getPayStatus());
        verify(orderMapper, never()).updateById(any(YyOrder.class));
    }

    @Test
    void createCustomerOrderShouldRequireBoundPhone() {
        String guestToken = loginTokenWithoutPhone();
        assertThrows(ServiceException.class, () ->
            service.createCustomerOrder("Bearer " + guestToken, customerOrderCreateBo(1L, 2L)));
        verify(orderMapper, never()).insert(any(YyOrder.class));
    }

    @Test
    void createCustomerOrderShouldNotReserveSlotWhenOnlinePaymentIsPlaceholder() {
        ReflectionTestUtils.setField(service, "defaultTenantId", "000000");
        String token = boundPhoneToken(TEST_PHONE);
        YyStore store = activeStore(900000000000000100L);
        YyProduct product = activeProduct(900000000000010100L, store.getId());
        when(storeMapper.selectById(store.getId())).thenReturn(store);
        when(productMapper.selectById(product.getId())).thenReturn(product);
        when(orderMapper.insert(any(YyOrder.class))).thenReturn(1);
        when(customerService.upsertByMobile(
            eq("客户预约"),
            eq(TEST_PHONE),
            eq("CLIENT_PUBLIC"),
            eq(BigDecimal.ZERO),
            any(),
            eq("客户公开端预约")
        )).thenReturn(930000000000000001L);

        Map<String, Object> result = service.createCustomerOrder("Bearer " + token, customerOrderCreateBo(store.getId(), product.getId()));

        ArgumentCaptor<YyOrder> captor = ArgumentCaptor.forClass(YyOrder.class);
        verify(orderMapper).insert(captor.capture());
        YyOrder inserted = captor.getValue();
        assertEquals("CLIENT_WEB", inserted.getChannelType());
        assertEquals("CUSTOMER_SELF", inserted.getBookingMethod());
        assertEquals("UNPAID", inserted.getPayStatus());
        assertEquals(TEST_PHONE, inserted.getCustomerPhone());
        assertEquals("2026-06-20", inserted.getSlotDate());
        assertEquals("10:00", inserted.getSlotStartTime());
        assertEquals("10:30", inserted.getSlotEndTime());
        verify(bookingSlotInventoryService, never()).confirmPaidOrderSlot(any(YyOrder.class));
        assertEquals(String.valueOf(inserted.getId()), result.get("orderId"));
        assertEquals("UNPAID", result.get("payStatus"));
    }

    @Test
    void rescheduleCustomerOrderShouldNotReleaseOrConfirmInventoryForUnpaidOrder() {
        String token = boundPhoneToken(TEST_PHONE);
        YyOrder existing = localCustomerOrder(9001L);
        existing.setInventoryStatus("");
        existing.setSlotDate("2026-06-20");
        existing.setSlotStartTime("10:00");
        existing.setSlotEndTime("10:30");

        YyOrder refreshed = localCustomerOrder(9001L);
        refreshed.setSlotDate("2026-06-21");
        refreshed.setSlotStartTime("11:00");
        refreshed.setSlotEndTime("11:30");

        when(orderMapper.selectById(9001L)).thenReturn(existing, refreshed, refreshed);

        ClientCustomerOrderRescheduleBo bo = new ClientCustomerOrderRescheduleBo();
        bo.setNewDate("2026-06-21");
        bo.setNewTimeSlot("11:00-11:30");
        bo.setReason("客户时间调整");

        service.rescheduleCustomerOrder("Bearer " + token, 9001L, bo);

        verify(bookingSlotInventoryService, never()).releaseConfirmedOrderSlot(any(YyOrder.class));
        verify(bookingSlotInventoryService, never()).confirmPaidOrderSlot(any(YyOrder.class));
    }

    @Test
    void customerOrderShouldExposePendingSelectionAlbumEntryForCompletedOrder() {
        String token = boundPhoneToken(TEST_PHONE);
        YyOrder order = localCustomerOrder(9001L);
        order.setOrderNo("YY-CUST-9001");
        order.setStatus("COMPLETED");
        order.setPayStatus("PAID");
        when(orderMapper.selectById(9001L)).thenReturn(order);
        when(photoAlbumMapper.selectList(any())).thenReturn(List.of(activeAlbum(990202606230001L, 9001L, "WAITING")));

        Map<String, Object> result = service.customerOrder("Bearer " + token, 9001L);

        assertEquals("PENDING_SELECTION", result.get("status"));
        assertEquals("待选片", result.get("statusLabel"));
        assertEquals("990202606230001", result.get("albumId"));
    }

    @Test
    void customerOrderShouldExposeDeliveredAlbumEntryWhenAlbumDeliveryIsDone() {
        String token = boundPhoneToken(TEST_PHONE);
        YyOrder order = localCustomerOrder(9002L);
        order.setOrderNo("YY-CUST-9002");
        order.setStatus("COMPLETED");
        order.setPayStatus("PAID");
        when(orderMapper.selectById(9002L)).thenReturn(order);
        when(photoAlbumMapper.selectList(any())).thenReturn(List.of(activeAlbum(990202606230002L, 9002L, "DELIVERED")));

        Map<String, Object> result = service.customerOrder("Bearer " + token, 9002L);

        assertEquals("DELIVERED", result.get("status"));
        assertEquals("已完成", result.get("statusLabel"));
        assertEquals("990202606230002", result.get("albumId"));
    }

    @Test
    void customerOrderShouldExposePickupAndDetailLinksWhenAlbumExists() {
        String token = boundPhoneToken(TEST_PHONE);
        YyOrder order = localCustomerOrder(9003L);
        order.setOrderNo("YY-CUST-9003");
        order.setStatus("COMPLETED");
        order.setPayStatus("PAID");
        when(orderMapper.selectById(9003L)).thenReturn(order);
        when(photoAlbumMapper.selectList(any())).thenReturn(List.of(activeAlbum(990202606230003L, 9003L, "DELIVERED")));

        Map<String, Object> result = service.customerOrder("Bearer " + token, 9003L);

        assertEquals("https://photo.evanshine.me/customer/albums/990202606230003", result.get("pickupUrl"));
        assertEquals("https://photo.evanshine.me/customer/orders/YY-CUST-9003", result.get("orderDetailUrl"));
    }

    @Test
    void customerOrderShouldExposeExternalStatusForDouyinLifeOrders() {
        String token = boundPhoneToken(TEST_PHONE);
        YyOrder order = localCustomerOrder(9004L);
        order.setChannelType("DOUYIN_LIFE");
        order.setSource("DOUYIN_LIFE");
        order.setExternalOrderId("dy-order-9004");
        when(orderMapper.selectById(9004L)).thenReturn(order);
        when(channelOrderMappingMapper.selectOne(any())).thenReturn(channelMapping("DOUYIN_LIFE", "dy-order-9004", "WAIT_CONFIRM"));

        Map<String, Object> result = service.customerOrder("Bearer " + token, 9004L);

        assertEquals("WAIT_CONFIRM", result.get("externalStatus"));
    }

    private String loginTokenWithoutPhone() {
        ClientCustomerLoginBo bo = new ClientCustomerLoginBo();
        bo.setCode("wechat-code");
        return String.valueOf(service.customerLogin(bo).get("accessToken"));
    }

    private String boundPhoneToken(String phone) {
        String guestToken = loginTokenWithoutPhone();
        when(customerService.upsertByMobile(
            eq("影约会员"),
            eq(phone),
            eq("CLIENT_PUBLIC"),
            eq(BigDecimal.ZERO),
            any(),
            eq("客户公开端绑定手机号")
        )).thenReturn(930000000000000001L);
        ClientCustomerBindPhoneBo bo = new ClientCustomerBindPhoneBo();
        bo.setPhone(phone);
        return String.valueOf(service.bindPhone("Bearer " + guestToken, bo).get("accessToken"));
    }

    private YyOrder localCustomerOrder(Long id) {
        YyOrder order = new YyOrder();
        order.setId(id);
        order.setCustomerPhone(TEST_PHONE);
        order.setChannelType("CLIENT_WEB");
        order.setSource("CLIENT_PUBLIC");
        order.setStatus("PENDING");
        order.setPayStatus("UNPAID");
        return order;
    }

    private YyStore activeStore(Long id) {
        YyStore store = new YyStore();
        store.setId(id);
        store.setStoreName("影约云旗舰店");
        store.setStatus("ACTIVE");
        return store;
    }

    private YyStore internalDefaultStore() {
        YyStore store = activeStore(2063619430924812290L);
        store.setStoreCode("DY-LIFE-DEFAULT");
        store.setStoreName("抖音来客默认门店");
        return store;
    }

    private YyProduct activeProduct(Long id, Long storeId) {
        YyProduct product = new YyProduct();
        product.setId(id);
        product.setStoreId(storeId);
        product.setProductName("职业形象照");
        product.setProductType("PORTRAIT");
        product.setPrice(new BigDecimal("199.00"));
        product.setStatus("ACTIVE");
        return product;
    }

    private YyPhotoAlbum activeAlbum(Long id, Long orderId, String selectionStatus) {
        YyPhotoAlbum album = new YyPhotoAlbum();
        album.setId(id);
        album.setOrderId(orderId);
        album.setStatus("ACTIVE");
        album.setSelectionStatus(selectionStatus);
        album.setDelFlag("0");
        return album;
    }

    private YyChannelOrderMapping channelMapping(String channelType, String externalOrderId, String externalStatus) {
        YyChannelOrderMapping mapping = new YyChannelOrderMapping();
        mapping.setChannelType(channelType);
        mapping.setExternalOrderId(externalOrderId);
        mapping.setExternalStatus(externalStatus);
        return mapping;
    }

    private ClientCustomerOrderCreateBo customerOrderCreateBo(Long storeId, Long productId) {
        ClientCustomerOrderCreateBo bo = new ClientCustomerOrderCreateBo();
        bo.setStoreId(String.valueOf(storeId));
        bo.setSkuId(String.valueOf(productId));
        bo.setCustomerName("客户预约");
        bo.setCustomerPhone(TEST_PHONE);
        bo.setAppointmentDate("2026-06-20");
        bo.setTimeSlot("10:00-10:30");
        bo.setRemark("客户自助预约");
        return bo;
    }
}
