package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.core.toolkit.IdWorker;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.tenant.helper.TenantHelper;
import org.dromara.yy.domain.YyBookingSlotInventory;
import org.dromara.yy.domain.YyChannelOrderMapping;
import org.dromara.yy.domain.YyCustomer;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.YyPhotoAlbum;
import org.dromara.yy.domain.YyProduct;
import org.dromara.yy.domain.YyServiceGroup;
import org.dromara.yy.domain.YyStore;
import org.dromara.yy.service.impl.YyClientCustomerTokenCodec.CustomerIdentity;
import org.dromara.yy.domain.bo.ClientCustomerBindPhoneBo;
import org.dromara.yy.domain.bo.ClientCustomerLoginBo;
import org.dromara.yy.domain.bo.ClientCustomerOrderCancelBo;
import org.dromara.yy.domain.bo.ClientCustomerOrderCreateBo;
import org.dromara.yy.domain.bo.ClientCustomerOrderRescheduleBo;
import org.dromara.yy.domain.bo.YyEntitlementReservationCreateBo;
import org.dromara.yy.domain.bo.YyOrderAttributeValueBo;
import org.dromara.yy.mapper.YyBookingSlotInventoryMapper;
import org.dromara.yy.mapper.YyChannelOrderMappingMapper;
import org.dromara.yy.mapper.YyCustomerMapper;
import org.dromara.yy.mapper.YyOrderMapper;
import org.dromara.yy.mapper.YyPhotoAlbumMapper;
import org.dromara.yy.mapper.YyProductMapper;
import org.dromara.yy.mapper.YyServiceGroupMapper;
import org.dromara.yy.mapper.YyStoreMapper;
import org.dromara.yy.service.IYyBookingSlotInventoryService;
import org.dromara.yy.service.IYyClientPublicApiService;
import org.dromara.yy.service.IYyCustomerService;
import org.dromara.yy.service.IYyTransactionSafetyService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/**
 * Joe/uniapp 客户端公开接口真实后端。
 */
@RequiredArgsConstructor
@Service
public class YyClientPublicApiServiceImpl implements IYyClientPublicApiService {

    private static final long CUSTOMER_TOKEN_TTL_SECONDS = YyClientCustomerTokenCodec.TOKEN_TTL_SECONDS;
    private static final String DEFAULT_TOKEN_SECRET = YyClientCustomerTokenCodec.DEFAULT_TOKEN_SECRET;
    private final YyStoreMapper storeMapper;
    private final YyProductMapper productMapper;
    private final YyBookingSlotInventoryMapper inventoryMapper;
    private final YyOrderMapper orderMapper;
    private final YyPhotoAlbumMapper photoAlbumMapper;
    private final YyChannelOrderMappingMapper channelOrderMappingMapper;
    private final YyCustomerMapper customerMapper;
    private final YyServiceGroupMapper serviceGroupMapper;
    private final IYyCustomerService customerService;
    private final IYyBookingSlotInventoryService bookingSlotInventoryService;
    private final IYyTransactionSafetyService transactionSafetyService;

    @Value("${yy.client-public.default-tenant-id:000000}")
    private String defaultTenantId = "000000";

    @Value("${yy.client-public.brand-code:yingyue}")
    private String defaultBrandCode = "yingyue";

    @Value("${yy.client-public.brand-name:影约云}")
    private String defaultBrandName = "影约云";

    @Value("${yy.client-public.token-secret:" + DEFAULT_TOKEN_SECRET + "}")
    private String customerTokenSecret = DEFAULT_TOKEN_SECRET;

    @Value("${yy.client-public.wechat.appid:}")
    private String wechatAppId = "";

    @Value("${yy.client-public.wechat.secret:}")
    private String wechatAppSecret = "";

    @Value("${yy.client-order.public-base-url:https://photo.evanshine.me}")
    private String clientOrderPublicBaseUrl = "https://photo.evanshine.me";

    @Override
    public Map<String, Object> brand(String brandCode) {
        return TenantHelper.dynamic(defaultTenantId, () -> doBrand(brandCode));
    }

    @Override
    public Map<String, Object> home(String brandCode) {
        return TenantHelper.dynamic(defaultTenantId, () -> {
            String normalizedBrandCode = normalizeBrandCode(brandCode);
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("brand", doBrand(normalizedBrandCode));
            data.put("banners", List.of());
            data.put("categories", YyClientPublicCatalogAssembler.productCategories(listActiveProducts(null)));
            data.put("menuItems", YyClientPublicCatalogAssembler.defaultMenuItems());
            data.put("serviceNotice", "请按真实门店、套餐和可预约时段提交预约。抖音来客订单请以平台状态为准。");
            return data;
        });
    }

    @Override
    public List<Map<String, Object>> stores(String brandCode, String keyword) {
        return TenantHelper.dynamic(defaultTenantId, () -> listActiveStores(keyword).stream()
            .map(YyClientPublicCatalogAssembler::storeMap)
            .toList());
    }

    @Override
    public Map<String, Object> storeProducts(Long storeId) {
        return TenantHelper.dynamic(defaultTenantId, () -> {
            YyStore store = requireStore(storeId);
            List<YyProduct> products = listActiveProducts(storeId);
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("store", YyClientPublicCatalogAssembler.storeMap(store));
            data.put("categories", YyClientPublicCatalogAssembler.productCategories(products));
            data.put("products", products.stream().map(YyClientPublicCatalogAssembler::productMap).toList());
            return data;
        });
    }

    @Override
    public Map<String, Object> productDetail(Long productId) {
        return TenantHelper.dynamic(defaultTenantId, () -> {
            YyProduct product = requireProduct(productId);
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("product", YyClientPublicCatalogAssembler.productMap(product));
            data.put("skus", List.of(YyClientPublicCatalogAssembler.skuMap(product)));
            if (product.getStoreId() != null) {
                data.put("store", YyClientPublicCatalogAssembler.storeMap(requireStore(product.getStoreId())));
            }
            return data;
        });
    }

    @Override
    public List<Map<String, Object>> storeSlots(Long storeId, String date, Long productId) {
        return TenantHelper.dynamic(defaultTenantId, () -> {
            requireStore(storeId);
            String normalizedDate = normalizeDate(date);
            String productSkuId = productId == null ? "" : String.valueOf(productId);
            return inventoryMapper.selectList(Wrappers.<YyBookingSlotInventory>lambdaQuery()
                    .eq(YyBookingSlotInventory::getStoreId, storeId)
                    .eq(YyBookingSlotInventory::getBizDate, normalizedDate)
                    .eq(YyBookingSlotInventory::getStatus, "ACTIVE")
                    .and(StringUtils.isNotBlank(productSkuId), wrapper -> wrapper
                        .eq(YyBookingSlotInventory::getExternalSkuId, productSkuId)
                        .or()
                        .eq(YyBookingSlotInventory::getExternalSkuId, "")
                        .or()
                        .isNull(YyBookingSlotInventory::getExternalSkuId))
                    .orderByAsc(YyBookingSlotInventory::getStartTime)
                    .orderByAsc(YyBookingSlotInventory::getId))
                .stream()
                .map(YyClientPublicCatalogAssembler::slotMap)
                .toList();
        });
    }

    @Override
    public Map<String, Object> customerLogin(ClientCustomerLoginBo bo) {
        String code = StringUtils.trimToEmpty(bo.getCode());
        if (StringUtils.isBlank(code)) {
            throw new ServiceException("微信登录凭证不能为空");
        }
        String subject = resolveWechatSubject(code);
        return customerAuthResponse(subject, "", null);
    }

    private String resolveWechatSubject(String code) {
        if (StringUtils.isBlank(wechatAppId) || StringUtils.isBlank(wechatAppSecret)) {
            return "wx:" + YyClientCustomerTokenCodec.sha256(code).substring(0, 24);
        }
        try {
            java.net.URI uri = java.net.URI.create(
                "https://api.weixin.qq.com/sns/jscode2session?appid=" + wechatAppId
                + "&secret=" + wechatAppSecret
                + "&js_code=" + code
                + "&grant_type=authorization_code");
            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                .uri(uri)
                .timeout(java.time.Duration.ofSeconds(10))
                .GET()
                .build();
            java.net.http.HttpResponse<String> response = java.net.http.HttpClient.newBuilder()
                .connectTimeout(java.time.Duration.ofSeconds(5))
                .build()
                .send(request, java.net.http.HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            String body = response.body();
            com.fasterxml.jackson.databind.JsonNode root = new com.fasterxml.jackson.databind.ObjectMapper().readTree(body);
            String openid = root.path("openid").asText("");
            if (StringUtils.isNotBlank(openid)) {
                return "wx:" + openid;
            }
            String errcode = root.path("errcode").asText("0");
            String errmsg = root.path("errmsg").asText("unknown");
            throw new ServiceException("微信登录失败: errcode=" + errcode + " errmsg=" + errmsg);
        } catch (ServiceException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ServiceException("微信登录请求失败: " + ex.getMessage());
        }
    }

    @Override
    public Map<String, Object> bindPhone(String authorization, ClientCustomerBindPhoneBo bo) {
        CustomerIdentity identity = parseCustomerToken(authorization);
        String phone = YyClientOrderPhoneMatcher.normalizePhone(bo.getPhone());
        if (!phone.matches("1\\d{10}")) {
            throw new ServiceException("手机号格式不正确");
        }
        Long customerId = TenantHelper.dynamic(defaultTenantId, () ->
            customerService.upsertByMobile("影约会员", phone, "CLIENT_PUBLIC", BigDecimal.ZERO, new Date(), "客户公开端绑定手机号"));
        return customerAuthResponse(String.valueOf(customerId), phone, customerId);
    }

    @Override
    public Map<String, Object> customerProfile(String authorization) {
        CustomerIdentity identity = parseCustomerToken(authorization);
        return TenantHelper.dynamic(defaultTenantId, () -> profileMap(identity));
    }

    @Override
    public Map<String, Object> orderSummary(String authorization) {
        CustomerIdentity identity = requirePhoneIdentity(authorization);
        return TenantHelper.dynamic(defaultTenantId, () -> {
            List<YyOrder> orders = ordersForPhone(identity.phone());
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("totalOrders", orders.size());
            data.put("pendingPaymentCount", orders.stream().filter(order -> "UNPAID".equalsIgnoreCase(StringUtils.trimToEmpty(order.getPayStatus()))).count());
            data.put("pendingSelectionCount", countPendingSelection(orders));
            data.put("completedCount", orders.stream().filter(order -> Set.of("COMPLETED", "DELIVERED").contains(normalized(order.getStatus()))).count());
            data.put("downloadablePhotoCount", 0);
            return data;
        });
    }

    @Override
    public Map<String, Object> customerOrders(String authorization, Integer page, Integer size, String status) {
        CustomerIdentity identity = requirePhoneIdentity(authorization);
        return TenantHelper.dynamic(defaultTenantId, () -> {
            int pageIndex = Math.max(1, Objects.requireNonNullElse(page, 0) + 1);
            int pageSize = Math.min(Math.max(1, Objects.requireNonNullElse(size, 20)), 100);
            String normalizedPhone = YyClientOrderPhoneMatcher.normalizePhone(identity.phone());
            List<String> phoneCandidates = YyClientOrderPhoneMatcher.clientOrderPhoneLookupCandidates(normalizedPhone);
            if (phoneCandidates.isEmpty()) {
                Map<String, Object> empty = new LinkedHashMap<>();
                empty.put("content", List.of());
                empty.put("records", List.of());
                empty.put("totalElements", 0L);
                empty.put("total", 0L);
                empty.put("number", pageIndex - 1);
                empty.put("page", pageIndex - 1);
                empty.put("size", pageSize);
                empty.put("last", true);
                return empty;
            }
            LambdaQueryWrapper<YyOrder> wrapper = Wrappers.<YyOrder>lambdaQuery()
                .in(YyOrder::getCustomerPhone, phoneCandidates)
                .orderByDesc(YyOrder::getOrderTime)
                .orderByDesc(YyOrder::getId);
            if (StringUtils.isNotBlank(status)) {
                wrapper.eq(YyOrder::getStatus, status.toUpperCase(Locale.ROOT));
            }
            IPage<YyOrder> pageResult = orderMapper.selectPage(new Page<>(pageIndex, pageSize), wrapper);
            List<Map<String, Object>> content = pageResult.getRecords().stream()
                .filter(order -> YyClientOrderPhoneMatcher.matchesClientOrderPhone(normalizedPhone, order.getCustomerPhone()))
                .map(this::toCustomerOrderMap)
                .toList();
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("content", content);
            data.put("records", content);
            data.put("totalElements", pageResult.getTotal());
            data.put("total", pageResult.getTotal());
            data.put("number", (int) pageResult.getCurrent() - 1);
            data.put("page", (int) pageResult.getCurrent() - 1);
            data.put("size", (int) pageResult.getSize());
            data.put("last", pageResult.getCurrent() >= pageResult.getPages());
            return data;
        });
    }

    @Override
    public Map<String, Object> customerOrder(String authorization, Long orderId) {
        CustomerIdentity identity = requirePhoneIdentity(authorization);
        return TenantHelper.dynamic(defaultTenantId, () -> toCustomerOrderMap(requireAuthorizedOrder(identity, orderId)));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> createCustomerOrder(String authorization, ClientCustomerOrderCreateBo bo) {
        CustomerIdentity identity = requirePhoneIdentity(authorization);
        return TenantHelper.dynamic(defaultTenantId, () -> doCreateCustomerOrder(bo, identity.phone()));
    }

    @Override
    public Map<String, Object> payCustomerOrder(String authorization, Long orderId) {
        CustomerIdentity identity = requirePhoneIdentity(authorization);
        return TenantHelper.dynamic(defaultTenantId, () -> {
            YyOrder order = requireAuthorizedOrder(identity, orderId);
            YyPaymentOrderPolicy.validateCustomerPayableOrder(order, defaultTenantId);
            return YyClientPaymentPlaceholderAssembler.customerPayResponse(order);
        });
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> cancelCustomerOrder(String authorization, Long orderId, ClientCustomerOrderCancelBo bo) {
        CustomerIdentity identity = requirePhoneIdentity(authorization);
        return TenantHelper.dynamic(defaultTenantId, () -> {
            YyOrder existing = requireAuthorizedLocalOrder(identity, orderId);
            String status = normalized(existing.getStatus());
            if (Set.of("COMPLETED", "CANCELLED", "REFUNDED").contains(status)) {
                throw new ServiceException("当前订单状态不可取消");
            }
            if ("CONFIRMED".equals(existing.getInventoryStatus())) {
                bookingSlotInventoryService.releaseConfirmedOrderSlot(existing);
            }
            YyOrder update = new YyOrder();
            update.setId(existing.getId());
            update.setStatus("CANCELLED");
            update.setRemark(appendRemark(existing.getRemark(), "客户取消：" + StringUtils.trimToEmpty(bo == null ? "" : bo.getReason())));
            orderMapper.updateById(update);
            return toCustomerOrderMap(orderMapper.selectById(existing.getId()));
        });
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> rescheduleCustomerOrder(String authorization, Long orderId, ClientCustomerOrderRescheduleBo bo) {
        CustomerIdentity identity = requirePhoneIdentity(authorization);
        return TenantHelper.dynamic(defaultTenantId, () -> {
            YyOrder existing = requireAuthorizedLocalOrder(identity, orderId);
            if ("CANCELLED".equals(normalized(existing.getStatus())) || "COMPLETED".equals(normalized(existing.getStatus()))) {
                throw new ServiceException("当前订单状态不可改期");
            }
            TimeRange range = parseTimeSlot(bo.getNewTimeSlot());
            boolean inventoryWasConfirmed = "CONFIRMED".equals(existing.getInventoryStatus());
            if (inventoryWasConfirmed) {
                bookingSlotInventoryService.releaseConfirmedOrderSlot(existing);
            }
            YyOrder update = new YyOrder();
            update.setId(existing.getId());
            update.setArrivalTime(toDate(bo.getNewDate(), range.start()));
            update.setSlotDate(normalizeDate(bo.getNewDate()));
            update.setSlotStartTime(range.start());
            update.setSlotEndTime(range.end());
            update.setInventorySlotId(null);
            update.setInventoryStatus("");
            update.setConflictReason("");
            update.setStatus("PENDING_INVENTORY");
            update.setRemark(appendRemark(existing.getRemark(), "客户改期：" + StringUtils.trimToEmpty(bo.getReason())));
            orderMapper.updateById(update);
            YyOrder refreshed = orderMapper.selectById(existing.getId());
            if (inventoryWasConfirmed || "PAID".equalsIgnoreCase(StringUtils.trimToEmpty(refreshed.getPayStatus()))) {
                bookingSlotInventoryService.confirmPaidOrderSlot(refreshed);
                refreshed = orderMapper.selectById(existing.getId());
            }
            return toCustomerOrderMap(refreshed);
        });
    }

    private Map<String, Object> doCreateCustomerOrder(ClientCustomerOrderCreateBo bo, String authenticatedPhone) {
        Long storeId = parseLong(bo.getStoreId(), "门店不能为空");
        Long productId = parseLong(bo.getSkuId(), "商品规格不能为空");
        Long serviceGroupId = parseOptionalLong(bo.getServiceGroupId(), "serviceGroupId invalid");
        YyStore store = requireStore(storeId);
        YyProduct product = requireProduct(productId);
        validateServiceGroup(serviceGroupId, store.getId());
        if (!Objects.equals(product.getStoreId(), store.getId())) {
            throw new ServiceException("商品不属于当前门店");
        }
        String phone = YyClientOrderPhoneMatcher.normalizePhone(authenticatedPhone);
        if (!phone.matches("1\\d{10}")) {
            throw new ServiceException("手机号格式不正确");
        }
        String customerName = StringUtils.substring(StringUtils.trimToEmpty(bo.getCustomerName()), 0, 64);
        if (StringUtils.isBlank(customerName)) {
            throw new ServiceException("客户姓名不能为空");
        }
        TimeRange range = parseTimeSlot(bo.getTimeSlot());
        String slotDate = normalizeDate(bo.getAppointmentDate());
        Date now = new Date();
        YyOrder order = new YyOrder();
        order.setId(IdWorker.getId());
        order.setTenantId(defaultTenantId);
        order.setStoreId(store.getId());
        order.setOrderNo("YY-CUST-" + order.getId());
        order.setCustomerName(customerName);
        order.setCustomerPhone(phone);
        order.setSource("CLIENT_PUBLIC");
        order.setChannelType("CLIENT_WEB");
        order.setBookingMethod("CUSTOMER_SELF");
        order.setOrderTime(now);
        order.setArrivalTime(toDate(slotDate, range.start()));
        order.setStatus("PENDING");
        order.setPayStatus("UNPAID");
        order.setTotalAmountCent(toCent(product.getPrice()));
        order.setPaidAmountCent(0L);
        order.setRefundStatus("");
        order.setRefundAmountCent(0L);
        order.setExternalOrderId("");
        order.setExternalProductId(String.valueOf(product.getId()));
        order.setExternalSkuId(String.valueOf(product.getId()));
        order.setExternalPoiId("");
        order.setSlotDate(slotDate);
        order.setSlotStartTime(range.start());
        order.setSlotEndTime(range.end());
        order.setServiceGroupId(serviceGroupId);
        order.setOrderAttributeJson(buildP1OrderAttributeJson(bo));
        order.setWorkstationNo("");
        order.setRemark(buildP1CustomerOrderRemark(bo));
        if (orderMapper.insert(order) <= 0) {
            throw new ServiceException("订单创建失败");
        }
        customerService.upsertByMobile(customerName, phone, "CLIENT_PUBLIC", BigDecimal.ZERO, now, "客户公开端预约");
        createP1EntitlementReservationIfNeeded(bo, order, findCustomerIdByPhone(phone));
        return toCustomerOrderMap(order);
    }

    private Map<String, Object> doBrand(String brandCode) {
        String normalizedBrandCode = normalizeBrandCode(brandCode);
        return YyClientPublicCatalogAssembler.brand(normalizedBrandCode, defaultBrandName);
    }

    private List<YyStore> listActiveStores(String keyword) {
        return storeMapper.selectList(Wrappers.<YyStore>lambdaQuery()
            .like(StringUtils.isNotBlank(keyword), YyStore::getStoreName, StringUtils.trimToEmpty(keyword))
            .in(YyStore::getStatus, List.of("0", "OPEN", "ACTIVE"))
            .orderByAsc(YyStore::getSort)
            .orderByAsc(YyStore::getId))
            .stream()
            .filter(this::isPublicCustomerStore)
            .toList();
    }

    private List<YyProduct> listActiveProducts(Long storeId) {
        List<YyProduct> products = productMapper.selectList(Wrappers.<YyProduct>lambdaQuery()
            .eq(storeId != null, YyProduct::getStoreId, storeId)
            .in(YyProduct::getStatus, List.of("0", "ON_SALE", "ACTIVE"))
            .orderByAsc(YyProduct::getSort)
            .orderByAsc(YyProduct::getId));
        if (storeId != null) {
            return products;
        }
        Set<Long> publicStoreIds = listActiveStores("").stream()
            .map(YyStore::getId)
            .filter(Objects::nonNull)
            .collect(java.util.stream.Collectors.toSet());
        return products.stream()
            .filter(product -> product.getStoreId() == null || publicStoreIds.contains(product.getStoreId()))
            .toList();
    }

    private YyStore requireStore(Long storeId) {
        if (storeId == null) {
            throw new ServiceException("门店不能为空");
        }
        YyStore store = storeMapper.selectById(storeId);
        if (store == null || !isActive(store.getStatus()) || !isPublicCustomerStore(store)) {
            throw new ServiceException("门店不存在或已停用");
        }
        return store;
    }

    private void validateServiceGroup(Long serviceGroupId, Long storeId) {
        if (serviceGroupId == null) {
            return;
        }
        YyServiceGroup group = serviceGroupMapper.selectById(serviceGroupId);
        if (group == null || !Objects.equals(group.getStoreId(), storeId) || !isActive(group.getStatus())) {
            throw new ServiceException("serviceGroupId unavailable");
        }
    }

    private boolean isPublicCustomerStore(YyStore store) {
        if (store == null) {
            return false;
        }
        String code = StringUtils.trimToEmpty(store.getStoreCode());
        String name = StringUtils.trimToEmpty(store.getStoreName());
        if ("DY-LIFE-DEFAULT".equalsIgnoreCase(code)) {
            return false;
        }
        return !name.contains("默认门店");
    }

    private YyProduct requireProduct(Long productId) {
        if (productId == null) {
            throw new ServiceException("商品不能为空");
        }
        YyProduct product = productMapper.selectById(productId);
        if (product == null || !isActive(product.getStatus())) {
            throw new ServiceException("商品不存在或已下架");
        }
        return product;
    }

    private Map<String, Object> toCustomerOrderMap(YyOrder order) {
        Map<String, Object> data = YyClientCustomerOrderAssembler.orderMap(order, storeMapper, productMapper, photoAlbumMapper);
        String albumId = Objects.toString(data.get("albumId"), "");
        data.put("pickupUrl", StringUtils.isBlank(albumId) ? "" : publicUrl("/customer/albums/" + albumId));
        data.put("orderDetailUrl", publicUrl("/customer/orders/" + encodePathSegment(firstNotBlank(order.getOrderNo(), String.valueOf(order.getId())))));
        data.put("externalStatus", queryExternalStatus(order.getSource(), order.getExternalOrderId()));
        return data;
    }

    private long countPendingSelection(List<YyOrder> orders) {
        List<Long> orderIds = orders.stream()
            .filter(order -> Set.of("COMPLETED", "DELIVERED").contains(normalized(order.getStatus())))
            .map(YyOrder::getId)
            .toList();
        if (orderIds.isEmpty()) {
            return 0;
        }
        List<YyPhotoAlbum> albums = photoAlbumMapper.selectList(Wrappers.<YyPhotoAlbum>lambdaQuery()
            .in(YyPhotoAlbum::getOrderId, orderIds)
            .eq(YyPhotoAlbum::getDelFlag, "0"));
        return albums.stream()
            .filter(album -> {
                String sel = StringUtils.defaultString(album.getSelectionStatus(), "WAITING").toUpperCase(Locale.ROOT);
                return "WAITING".equals(sel) || "SUBMITTED".equals(sel);
            })
            .count();
    }

    private List<YyOrder> ordersForPhone(String phone) {
        String normalizedPhone = YyClientOrderPhoneMatcher.normalizePhone(phone);
        List<String> phoneCandidates = YyClientOrderPhoneMatcher.clientOrderPhoneLookupCandidates(normalizedPhone);
        if (phoneCandidates.isEmpty()) {
            return List.of();
        }
        return orderMapper.selectList(Wrappers.<YyOrder>lambdaQuery()
            .in(YyOrder::getCustomerPhone, phoneCandidates)
            .orderByDesc(YyOrder::getOrderTime)
            .orderByDesc(YyOrder::getId)
            .last("limit 100")).stream()
            .filter(order -> YyClientOrderPhoneMatcher.matchesClientOrderPhone(normalizedPhone, order.getCustomerPhone()))
            .toList();
    }

    private YyOrder requireAuthorizedOrder(CustomerIdentity identity, Long orderId) {
        if (orderId == null) {
            throw new ServiceException("订单ID不能为空");
        }
        YyOrder order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new ServiceException("订单不存在");
        }
        if (!YyClientOrderPhoneMatcher.matchesClientOrderPhone(identity.phone(), order.getCustomerPhone())) {
            throw new ServiceException("无权访问该订单");
        }
        return order;
    }

    private YyOrder requireAuthorizedLocalOrder(CustomerIdentity identity, Long orderId) {
        YyOrder order = requireAuthorizedOrder(identity, orderId);
        if ("DOUYIN_LIFE".equalsIgnoreCase(StringUtils.trimToEmpty(order.getChannelType()))) {
            throw new ServiceException("抖音来客订单请在抖音来客或联系门店处理");
        }
        return order;
    }

    private Map<String, Object> customerAuthResponse(String subject, String phone, Long customerId) {
        String accessToken = buildCustomerToken(subject, phone);
        CustomerIdentity identity = new CustomerIdentity(subject, phone, Instant.now().plusSeconds(CUSTOMER_TOKEN_TTL_SECONDS).getEpochSecond());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("accessToken", accessToken);
        data.put("token", accessToken);
        data.put("refreshToken", "");
        data.put("expiresIn", CUSTOMER_TOKEN_TTL_SECONDS);
        data.put("expiresAt", Instant.ofEpochSecond(identity.expiresAt()).toString());
        data.put("user", profileMap(new CustomerIdentity(customerId == null ? subject : String.valueOf(customerId), phone, identity.expiresAt())));
        data.put("customer", data.get("user"));
        return data;
    }

    private Map<String, Object> profileMap(CustomerIdentity identity) {
        YyCustomer customer = null;
        if (StringUtils.isNotBlank(identity.phone())) {
            customer = customerMapper.selectOne(Wrappers.<YyCustomer>lambdaQuery()
                .eq(YyCustomer::getMobile, identity.phone())
                .orderByDesc(YyCustomer::getId)
                .last("limit 1"));
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", customer == null ? identity.subject() : String.valueOf(customer.getId()));
        data.put("phone", "");
        data.put("phoneMasked", StringUtils.isBlank(identity.phone()) ? "手机号未绑定" : YyClientOrderPhoneMatcher.maskPhone(identity.phone()));
        data.put("nickname", customer == null ? "影约会员" : StringUtils.defaultIfBlank(customer.getCustomerName(), "影约会员"));
        data.put("avatarUrl", "");
        data.put("memberLevel", customer == null ? "NORMAL" : StringUtils.defaultIfBlank(customer.getMemberLevel(), "NORMAL"));
        data.put("platform", "H5");
        data.put("createdAt", "");
        return data;
    }

    private CustomerIdentity requirePhoneIdentity(String authorization) {
        CustomerIdentity identity = parseCustomerToken(authorization);
        if (StringUtils.isBlank(identity.phone())) {
            throw new ServiceException("请先绑定手机号");
        }
        return identity;
    }

    private CustomerIdentity parseCustomerToken(String authorization) {
        return YyClientCustomerTokenCodec.parse(authorization, customerTokenSecret);
    }

    private String buildCustomerToken(String subject, String phone) {
        return YyClientCustomerTokenCodec.build(subject, phone, customerTokenSecret);
    }

    private TimeRange parseTimeSlot(String timeSlot) {
        String value = StringUtils.trimToEmpty(timeSlot).replace("~", "-").replace("—", "-").replace("至", "-");
        String[] parts = value.split("-");
        if (parts.length < 2) {
            throw new ServiceException("预约时段格式不正确");
        }
        String start = normalizeTime(parts[0]);
        String end = normalizeTime(parts[1]);
        if (!LocalTime.parse(start).isBefore(LocalTime.parse(end))) {
            throw new ServiceException("预约时段格式不正确");
        }
        return new TimeRange(start, end);
    }

    private String normalizeDate(String date) {
        try {
            return LocalDate.parse(StringUtils.trimToEmpty(date)).toString();
        } catch (RuntimeException ex) {
            throw new ServiceException("日期格式不正确");
        }
    }

    private String normalizeTime(String time) {
        String value = StringUtils.trimToEmpty(time);
        try {
            return LocalTime.parse(value.length() == 5 ? value : value + ":00").format(DateTimeFormatter.ofPattern("HH:mm"));
        } catch (RuntimeException ex) {
            throw new ServiceException("时间格式不正确");
        }
    }

    private Date toDate(String date, String time) {
        LocalDateTime localDateTime = LocalDateTime.of(LocalDate.parse(normalizeDate(date)), LocalTime.parse(normalizeTime(time)));
        return Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant());
    }

    private Long parseLong(String value, String message) {
        Long parsed = tryParseLong(value);
        if (parsed == null) {
            throw new ServiceException(message);
        }
        return parsed;
    }

    private Long parseOptionalLong(String value, String message) {
        if (StringUtils.isBlank(value)) {
            return null;
        }
        Long parsed = tryParseLong(value);
        if (parsed == null) {
            throw new ServiceException(message);
        }
        return parsed;
    }

    private Long tryParseLong(String value) {
        try {
            return StringUtils.isBlank(value) ? null : Long.parseLong(value);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private Long toCent(BigDecimal value) {
        return value == null ? 0L : value.multiply(BigDecimal.valueOf(100)).longValue();
    }

    private String normalizeBrandCode(String brandCode) {
        return StringUtils.defaultIfBlank(StringUtils.trimToEmpty(brandCode), defaultBrandCode);
    }

    private boolean isActive(String status) {
        String normalized = normalized(status);
        return Set.of("0", "OPEN", "ACTIVE", "ON_SALE").contains(normalized);
    }

    private String normalized(String value) {
        return StringUtils.trimToEmpty(value).toUpperCase(Locale.ROOT);
    }

    private String queryExternalStatus(String source, String externalOrderId) {
        if (StringUtils.isBlank(source) || StringUtils.isBlank(externalOrderId)) {
            return "";
        }
        YyChannelOrderMapping mapping = channelOrderMappingMapper.selectOne(Wrappers.<YyChannelOrderMapping>lambdaQuery()
            .eq(YyChannelOrderMapping::getChannelType, source)
            .eq(YyChannelOrderMapping::getExternalOrderId, externalOrderId)
            .orderByDesc(YyChannelOrderMapping::getId)
            .last("limit 1"));
        return mapping == null ? "" : StringUtils.defaultString(mapping.getExternalStatus());
    }

    private String publicUrl(String path) {
        String base = StringUtils.trimToEmpty(clientOrderPublicBaseUrl).replaceAll("/+$", "");
        String normalizedPath = path.startsWith("/") ? path : "/" + path;
        return firstNotBlank(base, "https://photo.evanshine.me") + normalizedPath;
    }

    private String encodePathSegment(String value) {
        return URLEncoder.encode(firstNotBlank(value, ""), StandardCharsets.UTF_8).replace("+", "%20");
    }

    private String firstNotBlank(String... values) {
        if (values == null) {
            return "";
        }
        for (String value : values) {
            if (StringUtils.isNotBlank(value)) {
                return value;
            }
        }
        return "";
    }

    private String appendRemark(String existing, String addition) {
        String next = StringUtils.trimToEmpty(addition);
        if (StringUtils.isBlank(next)) {
            return StringUtils.substring(StringUtils.trimToEmpty(existing), 0, 500);
        }
        String combined = StringUtils.isBlank(existing) ? next : existing + "\n" + next;
        return StringUtils.substring(combined, 0, 500);
    }

    private String buildP1CustomerOrderRemark(ClientCustomerOrderCreateBo bo) {
        String remark = StringUtils.substring(StringUtils.trimToEmpty(bo.getRemark()), 0, 320);
        List<String> p1Notes = new java.util.ArrayList<>();
        int customFieldCount = bo.getCustomFields() == null ? 0 : bo.getCustomFields().size();
        if (customFieldCount > 0) {
            p1Notes.add("P1 custom fields saved to orderAttributeJson count=" + customFieldCount);
        }
        if (StringUtils.isNotBlank(bo.getEntitlementCandidateId())
            || StringUtils.isNotBlank(bo.getEntitlementKind())
            || StringUtils.isNotBlank(bo.getEntitlementUnavailableReason())) {
            p1Notes.add("P1 entitlement scaffold candidateId="
                + StringUtils.substring(StringUtils.trimToEmpty(bo.getEntitlementCandidateId()), 0, 64)
                + ", kind=" + StringUtils.substring(StringUtils.trimToEmpty(bo.getEntitlementKind()), 0, 32)
                + ", unavailableReason=" + StringUtils.substring(StringUtils.trimToEmpty(bo.getEntitlementUnavailableReason()), 0, 80));
        }
        return appendRemark(remark, String.join("; ", p1Notes));
    }

    private String buildP1OrderAttributeJson(ClientCustomerOrderCreateBo bo) {
        if (bo.getCustomFields() == null || bo.getCustomFields().isEmpty()) {
            return null;
        }
        List<YyOrderAttributeValueBo> values = bo.getCustomFields().entrySet().stream()
            .filter(entry -> StringUtils.isNotBlank(entry.getKey()) && StringUtils.isNotBlank(entry.getValue()))
            .limit(20)
            .map(entry -> {
                YyOrderAttributeValueBo value = new YyOrderAttributeValueBo();
                String key = StringUtils.substring(StringUtils.trimToEmpty(entry.getKey()), 0, 61);
                value.setFieldCode("p1_" + key);
                value.setFieldLabel(key);
                value.setFieldType("TEXT");
                value.setRequired(false);
                value.setSort(0);
                value.setValue(StringUtils.substring(StringUtils.trimToEmpty(entry.getValue()), 0, 500));
                return value;
            })
            .toList();
        return values.isEmpty() ? null : YyOrderAttributeSnapshotSupport.normalizeToJson(values);
    }

    private Long findCustomerIdByPhone(String phone) {
        YyCustomer customer = customerMapper.selectOne(Wrappers.<YyCustomer>lambdaQuery()
            .eq(YyCustomer::getMobile, phone)
            .orderByDesc(YyCustomer::getId)
            .last("limit 1"));
        return customer == null ? null : customer.getId();
    }

    private void createP1EntitlementReservationIfNeeded(ClientCustomerOrderCreateBo bo, YyOrder order, Long customerId) {
        if (customerId == null || StringUtils.isBlank(bo.getEntitlementCandidateId())
            || StringUtils.isNotBlank(bo.getEntitlementUnavailableReason())) {
            return;
        }
        YyEntitlementReservationCreateBo reservation = new YyEntitlementReservationCreateBo();
        reservation.setStoreId(order.getStoreId());
        reservation.setCustomerId(customerId);
        reservation.setOrderId(order.getId());
        reservation.setReservationType("P1_BOOKING");
        reservation.setTargetType(StringUtils.defaultIfBlank(StringUtils.trimToEmpty(bo.getEntitlementKind()), "ENTITLEMENT"));
        reservation.setTargetSnapshot("candidateId=" + StringUtils.substring(StringUtils.trimToEmpty(bo.getEntitlementCandidateId()), 0, 64)
            + ";kind=" + StringUtils.substring(StringUtils.trimToEmpty(bo.getEntitlementKind()), 0, 32)
            + ";orderNo=" + StringUtils.substring(StringUtils.trimToEmpty(order.getOrderNo()), 0, 64));
        reservation.setQuantity(BigDecimal.ONE);
        reservation.setReservationAmount(BigDecimal.ZERO);
        reservation.setExpireMinutes(30);
        reservation.setIdempotencyKey("P1-" + order.getId() + "-" + StringUtils.substring(StringUtils.trimToEmpty(bo.getEntitlementCandidateId()), 0, 64));
        reservation.setRemark("P1 booking entitlement reservation scaffold; no writeoff or deduction executed.");
        transactionSafetyService.createEntitlementReservation(reservation);
    }

    private record TimeRange(String start, String end) {
    }
}
