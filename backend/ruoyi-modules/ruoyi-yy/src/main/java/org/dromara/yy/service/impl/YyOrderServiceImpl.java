package org.dromara.yy.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.tenant.helper.TenantHelper;
import org.dromara.yy.domain.YyChannelOrderMapping;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.bo.ClientBookingIntentRequest;
import org.dromara.yy.domain.bo.YyOrderBo;
import org.dromara.yy.domain.bo.YyOrderCopyBo;
import org.dromara.yy.domain.bo.YyStaffBookingCreateBo;
import org.dromara.yy.domain.vo.ClientBookingIntentVo;
import org.dromara.yy.domain.vo.ClientOrderLinkVo;
import org.dromara.yy.domain.vo.ClientOrderTokenVo;
import org.dromara.yy.domain.vo.YyMobileOrderVo;
import org.dromara.yy.domain.vo.YyOrderVo;
import org.dromara.yy.domain.vo.YyPhotoAlbumVo;
import org.dromara.yy.mapper.YyChannelOrderMappingMapper;
import org.dromara.yy.mapper.YyEmployeeMapper;
import org.dromara.yy.mapper.YyEmployeeStoreMapper;
import org.dromara.yy.mapper.YyOrderMapper;
import org.dromara.yy.mapper.YyPhotoAlbumMapper;
import org.dromara.yy.mapper.YyPhotoAssetMapper;
import org.dromara.yy.mapper.YyServiceGroupMapper;
import org.dromara.yy.service.IYyBookingSlotInventoryService;
import org.dromara.yy.service.IYyCustomerService;
import org.dromara.yy.service.IYyOrderService;
import org.dromara.yy.service.IYyPhotoAlbumService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collection;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

import static org.dromara.yy.service.impl.YyClientOrderPhoneMatcher.clientOrderPhoneLookupCandidates;
import static org.dromara.yy.service.impl.YyClientOrderPhoneMatcher.isClientLookupPhone;
import static org.dromara.yy.service.impl.YyClientOrderPhoneMatcher.isPhoneLast4;
import static org.dromara.yy.service.impl.YyClientOrderPhoneMatcher.maskPhone;
import static org.dromara.yy.service.impl.YyClientOrderPhoneMatcher.matchesClientOrderPhone;
import static org.dromara.yy.service.impl.YyClientOrderPhoneMatcher.normalizePhone;
import static org.dromara.yy.service.impl.YyOrderInventoryUpdateCoordinator.explicitlyClearsRequiredSlotField;
import static org.dromara.yy.service.impl.YyOrderInventoryUpdateCoordinator.handleInventoryAfterOrderUpdate;
import static org.dromara.yy.service.impl.YyOrderInventoryUpdateCoordinator.hasSlotIdentity;
import static org.dromara.yy.service.impl.YyOrderInventoryUpdateCoordinator.isSlotIdentityChanged;
import static org.dromara.yy.service.impl.YyOrderInventoryUpdateCoordinator.mergeExistingOrderState;

/**
 * 影约云预约订单Service业务层处理
 */
@RequiredArgsConstructor
@Service
public class YyOrderServiceImpl implements IYyOrderService {

    private static final Map<String, Set<String>> ORDER_STATUS_TRANSITIONS = Map.of(
        "PENDING", Set.of("CONFIRMED", "CANCELLED"),
        "CONFIRMED", Set.of("ARRIVED", "SERVING", "CANCELLED"),
        "ARRIVED", Set.of("SERVING", "CANCELLED"),
        "SERVING", Set.of("COMPLETED"),
        "COMPLETED", Set.of(),
        "CANCELLED", Set.of()
    );

    private final YyOrderMapper baseMapper;
    private final YyChannelOrderMappingMapper channelOrderMappingMapper;
    private final YyPhotoAlbumMapper photoAlbumMapper;
    private final YyPhotoAssetMapper photoAssetMapper;
    private final YyEmployeeMapper employeeMapper;
    private final YyEmployeeStoreMapper employeeStoreMapper;
    private final YyServiceGroupMapper serviceGroupMapper;
    private final IYyCustomerService customerService;
    private final IYyPhotoAlbumService photoAlbumService;
    private final IYyBookingSlotInventoryService bookingSlotInventoryService;

    @Value("${yy.client-booking.default-store-id:900001}")
    private Long clientBookingDefaultStoreId = 900001L;

    @Value("${yy.client-booking.default-tenant-id:000000}")
    private String clientBookingDefaultTenantId = "000000";

    @Value("${yy.client-order.public-base-url:https://photo.evanshine.me}")
    private String clientOrderPublicBaseUrl = "https://photo.evanshine.me";

    @Value("${yy.client-order.token-secret:" + YyClientOrderTokenCodec.DEFAULT_TOKEN_SECRET + "}")
    private String clientOrderTokenSecret = YyClientOrderTokenCodec.DEFAULT_TOKEN_SECRET;

    @Value("${spring.profiles.active:}")
    private String activeProfiles = "";

    @Override
    public YyOrderVo queryById(Long id) {
        YyOrderVo vo = baseMapper.selectVoById(id);
        if (vo != null) {
            fillOrderAttributes(List.of(vo));
            fillPhotoAlbumCount(List.of(vo));
        }
        return vo;
    }

    @Override
    public TableDataInfo<YyOrderVo> queryPageList(YyOrderBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<YyOrder> lqw = buildQueryWrapper(bo);
        Page<YyOrderVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        fillChannelStatus(result.getRecords());
        fillOrderAttributes(result.getRecords());
        fillPhotoAlbumCount(result.getRecords());
        return TableDataInfo.build(result);
    }

    @Override
    public List<YyOrderVo> queryList(YyOrderBo bo) {
        List<YyOrderVo> list = baseMapper.selectVoList(buildQueryWrapper(bo));
        fillChannelStatus(list);
        fillOrderAttributes(list);
        fillPhotoAlbumCount(list);
        return list;
    }

    private LambdaQueryWrapper<YyOrder> buildQueryWrapper(YyOrderBo bo) {
        return YyOrderQueryBuilder.build(bo, employeeMapper, employeeStoreMapper);
    }

    @Override
    public Boolean insertByBo(YyOrderBo bo) {
        YyOrder add = BeanUtil.toBean(bo, YyOrder.class);
        applyOrderAttributeSnapshot(add, bo.getOrderAttributes());
        validEntityBeforeSave(add);
        validateVerticalServiceOverlap(add, null);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
            syncCustomerOnCreate(add);
        }
        return flag;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public YyOrderVo createStaffBooking(YyStaffBookingCreateBo bo) {
        YyOrderBookingFactory.StaffBookingDraft draft = YyOrderBookingFactory.createStaffBooking(bo);
        YyOrder order = draft.order();
        applyOrderAttributeSnapshot(order, bo.getOrderAttributes());
        validEntityBeforeSave(order);
        validateVerticalServiceOverlap(order, null);

        if (baseMapper.insert(order) <= 0) {
            throw new ServiceException("新增预约失败，请稍后重试");
        }
        syncCustomerOnCreate(order);
        if (draft.scheduled()) {
            bookingSlotInventoryService.confirmPaidOrderSlot(order);
        }
        return queryById(order.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public YyOrderVo copyOrder(Long sourceOrderId, YyOrderCopyBo bo) {
        YyOrder source = requireOrder(sourceOrderId);
        YyOrderCopyFactory.CopyDraft draft = YyOrderCopyFactory.createCopy(source, bo);
        YyOrder order = draft.order();
        validEntityBeforeSave(order);
        validateVerticalServiceOverlap(order, null);
        if (baseMapper.insert(order) <= 0) {
            throw new ServiceException("Create copied order failed, please retry");
        }
        syncCustomerOnCreate(order);
        if (draft.scheduled()) {
            bookingSlotInventoryService.confirmPaidOrderSlot(order);
        }
        return queryById(order.getId());
    }

    @Override
    public List<YyMobileOrderVo> queryMobileOrdersByPhone(Long storeId, String phone, String phoneLast4) {
        String normalizedPhone = normalizePhone(phone);
        String normalizedPhoneLast4 = normalizePhone(phoneLast4);
        if (storeId == null || !isClientLookupPhone(normalizedPhone) || !isPhoneLast4(normalizedPhoneLast4)
            || !normalizedPhone.endsWith(normalizedPhoneLast4)) {
            return List.of();
        }
        List<String> phoneCandidates = clientOrderPhoneLookupCandidates(normalizedPhone);
        List<YyOrder> orders = baseMapper.selectList(Wrappers.<YyOrder>lambdaQuery()
            .eq(YyOrder::getStoreId, storeId)
            .in(YyOrder::getCustomerPhone, phoneCandidates)
            .orderByDesc(YyOrder::getOrderTime)
            .orderByDesc(YyOrder::getId));
        return orders.stream()
            .filter(order -> Objects.equals(storeId, order.getStoreId()))
            .filter(order -> matchesClientOrderPhone(normalizedPhone, order.getCustomerPhone()))
            .map(this::toMobileOrderVo)
            .toList();
    }

    @Override
    public List<ClientOrderLinkVo> queryClientOrderLinksByPhone(Long storeId, String phone, String phoneLast4) {
        String normalizedPhone = normalizePhone(phone);
        String normalizedPhoneLast4 = normalizePhone(phoneLast4);
        if (storeId == null || !isClientLookupPhone(normalizedPhone)) {
            return List.of();
        }
        if (StringUtils.isNotBlank(normalizedPhoneLast4)
            && (!isPhoneLast4(normalizedPhoneLast4) || !normalizedPhone.endsWith(normalizedPhoneLast4))) {
            return List.of();
        }
        List<String> phoneCandidates = clientOrderPhoneLookupCandidates(normalizedPhone);
        List<YyOrder> orders = baseMapper.selectList(Wrappers.<YyOrder>lambdaQuery()
            .eq(YyOrder::getStoreId, storeId)
            .in(YyOrder::getCustomerPhone, phoneCandidates)
            .orderByDesc(YyOrder::getOrderTime)
            .orderByDesc(YyOrder::getId)
            .last("limit 20"));
        if (orders == null || orders.isEmpty()) {
            return List.of();
        }
        return toClientOrderLinks(orders.stream()
            .filter(order -> Objects.equals(storeId, order.getStoreId()))
            .filter(order -> matchesClientOrderPhone(normalizedPhone, order.getCustomerPhone()))
            .toList());
    }

    @Override
    public ClientOrderTokenVo verifyClientOrderAccess(Long storeId, String phone, String phoneLast4) {
        String normalizedPhone = normalizePhone(phone);
        List<ClientOrderLinkVo> orders = queryClientOrderLinksByPhone(storeId, normalizedPhone, phoneLast4);
        if (orders.isEmpty()) {
            throw new ServiceException("未找到匹配订单，请确认门店和手机号");
        }
        List<Long> orderIds = orders.stream()
            .map(ClientOrderLinkVo::getOrderId)
            .filter(StringUtils::isNotBlank)
            .map(Long::parseLong)
            .distinct()
            .toList();
        ClientOrderTokenVo vo = new ClientOrderTokenVo();
        vo.setClientOrderToken(YyClientOrderTokenCodec.build(storeId, orderIds, clientOrderTokenSecret, activeProfiles));
        vo.setExpiresIn(YyClientOrderTokenCodec.TOKEN_TTL_SECONDS);
        vo.setExpiresAt(Date.from(Instant.now().plusSeconds(YyClientOrderTokenCodec.TOKEN_TTL_SECONDS)));
        vo.setPhoneMasked(maskPhone(normalizedPhone));
        vo.setOrders(orders);
        return vo;
    }

    @Override
    public List<ClientOrderLinkVo> queryClientOrderLinksByToken(String clientOrderToken) {
        YyClientOrderTokenCodec.ClientOrderIdentity identity =
            YyClientOrderTokenCodec.parse(clientOrderToken, clientOrderTokenSecret, activeProfiles);
        List<YyOrder> orders = baseMapper.selectList(Wrappers.<YyOrder>lambdaQuery()
            .eq(YyOrder::getStoreId, identity.storeId())
            .in(YyOrder::getId, identity.orderIds())
            .orderByDesc(YyOrder::getOrderTime)
            .orderByDesc(YyOrder::getId)
            .last("limit 20"));
        if (orders == null || orders.isEmpty()) {
            return List.of();
        }
        Set<Long> authorizedIds = identity.orderIds();
        return toClientOrderLinks(orders.stream()
            .filter(order -> Objects.equals(identity.storeId(), order.getStoreId()))
            .filter(order -> authorizedIds.contains(order.getId()))
            .toList());
    }

    @Override
    public ClientOrderLinkVo queryClientOrderLinkByToken(String orderNo, String clientOrderToken) {
        String normalizedOrderNo = StringUtils.trimToEmpty(orderNo);
        if (StringUtils.isBlank(normalizedOrderNo)) {
            throw new ServiceException("订单号不能为空");
        }
        return queryClientOrderLinksByToken(clientOrderToken).stream()
            .filter(order -> normalizedOrderNo.equals(order.getOrderNo()))
            .findFirst()
            .orElseThrow(() -> new ServiceException("订单不存在或无权限访问"));
    }

    @Override
    public ClientBookingIntentVo createClientBookingIntent(ClientBookingIntentRequest request, String ip) {
        return TenantHelper.dynamic(clientBookingDefaultTenantId, () -> doCreateClientBookingIntent(request, ip));
    }

    private ClientBookingIntentVo doCreateClientBookingIntent(ClientBookingIntentRequest request, String ip) {
        YyOrder order = YyOrderBookingFactory.createClientBookingIntent(
            request,
            clientBookingDefaultStoreId,
            clientBookingDefaultTenantId,
            ip
        );
        boolean inserted = baseMapper.insert(order) > 0;
        if (!inserted) {
            throw new ServiceException("预约提交失败，请稍后重试");
        }
        syncCustomerOnCreate(order);
        return YyOrderBookingFactory.toClientBookingIntentVo(order);
    }

    @Override
    public YyPhotoAlbumVo repairPhotoAlbumPlaceholder(Long orderId) {
        if (orderId == null) {
            throw new ServiceException("订单ID不能为空");
        }
        YyOrder order = baseMapper.selectById(orderId);
        if (order == null) {
            throw new ServiceException("订单不存在");
        }
        return photoAlbumService.upsertPlaceholderForOrder(
            order,
            order.getSource(),
            order.getExternalOrderId(),
            "",
            ""
        );
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public YyOrderVo transitionStatus(Long id, String expectedStatus, String targetStatus, String remark) {
        YyOrder existing = requireOrder(id);
        assertExpectedStatus(existing, expectedStatus);
        String currentStatus = normalizedStatus(existing.getStatus());
        String nextStatus = normalizedStatus(targetStatus);
        if (StringUtils.isBlank(nextStatus)) {
            throw new ServiceException("目标状态不能为空");
        }
        if (!ORDER_STATUS_TRANSITIONS.getOrDefault(currentStatus, Set.of()).contains(nextStatus)) {
            throw new ServiceException("订单状态不允许从 " + currentStatus + " 流转到 " + nextStatus);
        }

        YyOrder update = new YyOrder();
        update.setId(id);
        update.setStatus(nextStatus);
        if (StringUtils.isNotBlank(remark)) {
            update.setRemark(StringUtils.substring(remark.trim(), 0, 500));
        }
        if (baseMapper.updateById(update) <= 0) {
            throw new ServiceException("订单状态更新失败，请刷新后重试");
        }
        if ("CANCELLED".equals(nextStatus) && "CONFIRMED".equals(existing.getInventoryStatus())) {
            bookingSlotInventoryService.releaseConfirmedOrderSlot(existing);
        }
        return queryById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public YyOrderVo reschedule(Long id, String expectedStatus, Date arrivalTime, Long serviceGroupId,
                                String slotDate, String slotStartTime, String slotEndTime, String remark) {
        if (arrivalTime == null) {
            throw new ServiceException("到店时间不能为空");
        }
        YyOrder existing = requireOrder(id);
        assertExpectedStatus(existing, expectedStatus);

        YyOrderBo bo = new YyOrderBo();
        bo.setId(id);
        bo.setStoreId(existing.getStoreId());
        bo.setOrderNo(existing.getOrderNo());
        bo.setSource(existing.getSource());
        bo.setStatus(existing.getStatus());
        bo.setArrivalTime(arrivalTime);
        bo.setServiceGroupId(serviceGroupId);
        bo.setSlotDate(slotDate);
        bo.setSlotStartTime(slotStartTime);
        bo.setSlotEndTime(slotEndTime);
        if (StringUtils.isNotBlank(remark)) {
            bo.setRemark(StringUtils.substring(remark.trim(), 0, 500));
        }
        updateByBo(bo);
        return queryById(id);
    }

    private YyOrder requireOrder(Long id) {
        if (id == null) {
            throw new ServiceException("订单ID不能为空");
        }
        YyOrder existing = baseMapper.selectById(id);
        if (existing == null) {
            throw new ServiceException("订单不存在");
        }
        return existing;
    }

    private void assertExpectedStatus(YyOrder existing, String expectedStatus) {
        String expected = normalizedStatus(expectedStatus);
        if (StringUtils.isBlank(expected)) {
            throw new ServiceException("当前状态不能为空");
        }
        String current = normalizedStatus(existing.getStatus());
        if (!Objects.equals(current, expected)) {
            throw new ServiceException("订单状态已变化，请刷新后重试");
        }
    }

    private static String normalizedStatus(String status) {
        return StringUtils.trimToEmpty(status).toUpperCase();
    }

    private YyMobileOrderVo toMobileOrderVo(YyOrder order) {
        YyMobileOrderVo vo = new YyMobileOrderVo();
        vo.setOrderNo(order.getOrderNo());
        vo.setSource(order.getSource());
        vo.setStatus(order.getStatus());
        vo.setExternalStatus(queryExternalStatus(order.getSource(), order.getExternalOrderId()));
        vo.setCustomerName(null);
        vo.setCustomerPhoneMasked(maskPhone(order.getCustomerPhone()));
        vo.setOrderTime(order.getOrderTime());
        return vo;
    }

    private List<ClientOrderLinkVo> toClientOrderLinks(List<YyOrder> orders) {
        return YyClientOrderLinkAssembler.toClientOrderLinks(
            orders,
            photoAlbumMapper,
            clientOrderPublicBaseUrl,
            this::queryExternalStatus
        );
    }

    private void fillChannelStatus(List<YyOrderVo> orders) {
        if (orders == null || orders.isEmpty()) {
            return;
        }
        List<YyOrderVo> channelOrders = orders.stream()
            .filter(order -> StringUtils.isNotBlank(order.getSource()))
            .filter(order -> StringUtils.isNotBlank(order.getExternalOrderId()))
            .toList();
        if (channelOrders.isEmpty()) {
            return;
        }

        Set<String> channelTypes = new LinkedHashSet<>();
        Set<String> externalOrderIds = new LinkedHashSet<>();
        for (YyOrderVo order : channelOrders) {
            channelTypes.add(order.getSource());
            externalOrderIds.add(order.getExternalOrderId());
        }

        List<YyChannelOrderMapping> mappings = channelOrderMappingMapper.selectList(Wrappers.<YyChannelOrderMapping>lambdaQuery()
            .in(YyChannelOrderMapping::getChannelType, channelTypes)
            .in(YyChannelOrderMapping::getExternalOrderId, externalOrderIds)
            .orderByDesc(YyChannelOrderMapping::getId));
        Map<String, YyChannelOrderMapping> latestMappings = new LinkedHashMap<>();
        for (YyChannelOrderMapping mapping : mappings) {
            latestMappings.putIfAbsent(mappingKey(mapping.getChannelType(), mapping.getExternalOrderId()), mapping);
        }
        for (YyOrderVo order : orders) {
            YyChannelOrderMapping mapping = latestMappings.get(mappingKey(order.getSource(), order.getExternalOrderId()));
            if (mapping != null) {
                order.setExternalStatus(mapping.getExternalStatus());
                order.setSyncStatus(mapping.getSyncStatus());
            }
        }
    }

    private void fillPhotoAlbumCount(List<YyOrderVo> orders) {
        YyOrderPhotoDeliveryFiller.fillPhotoAlbumCount(orders, photoAlbumMapper, photoAssetMapper);
    }

    private String queryExternalStatus(String source, String externalOrderId) {
        YyChannelOrderMapping mapping = queryLatestMapping(source, externalOrderId);
        return mapping == null ? "" : mapping.getExternalStatus();
    }

    private YyChannelOrderMapping queryLatestMapping(String source, String externalOrderId) {
        if (StringUtils.isBlank(source) || StringUtils.isBlank(externalOrderId)) {
            return null;
        }
        return channelOrderMappingMapper.selectOne(Wrappers.<YyChannelOrderMapping>lambdaQuery()
            .eq(YyChannelOrderMapping::getChannelType, source)
            .eq(YyChannelOrderMapping::getExternalOrderId, externalOrderId)
            .orderByDesc(YyChannelOrderMapping::getId)
            .last("limit 1"));
    }

    private static String mappingKey(String channelType, String externalOrderId) {
        return firstNotBlank(channelType, "") + "::" + firstNotBlank(externalOrderId, "");
    }

    private static String firstNotBlank(String... values) {
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

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean updateByBo(YyOrderBo bo) {
        if (bo == null || bo.getId() == null) {
            throw new ServiceException("订单ID不能为空");
        }
        YyOrder existing = baseMapper.selectById(bo.getId());
        if (existing == null) {
            throw new ServiceException("订单不存在");
        }
        YyOrder update = BeanUtil.toBean(bo, YyOrder.class);
        if ("PAID".equals(firstNotBlank(update.getPayStatus(), existing.getPayStatus()))
            && explicitlyClearsRequiredSlotField(update)) {
            throw new ServiceException("已支付订单改期需填写完整预约时段");
        }
        mergeExistingOrderState(update, existing);
        boolean slotChanged = isSlotIdentityChanged(existing, update);
        if (slotChanged && "PAID".equals(update.getPayStatus()) && !hasSlotIdentity(update)) {
            throw new ServiceException("已支付订单改期需填写完整预约时段");
        }
        if (slotChanged) {
            update.setInventorySlotId(null);
            update.setInventoryStatus("");
            update.setConflictReason("");
        }
        if (bo.getOrderAttributes() != null) {
            applyOrderAttributeSnapshot(update, bo.getOrderAttributes());
        }
        validEntityBeforeSave(update);
        validateVerticalServiceOverlap(update, existing.getId());
        boolean flag = baseMapper.updateById(update) > 0;
        if (flag) {
            handleInventoryAfterOrderUpdate(existing, update, slotChanged, bookingSlotInventoryService);
        }
        return flag;
    }

    private void validEntityBeforeSave(YyOrder entity) {
        if (StringUtils.isBlank(entity.getChannelType())) {
            entity.setChannelType(firstNotBlank(entity.getSource(), "LOCAL"));
        }
        if (StringUtils.isBlank(entity.getPayStatus())) {
            entity.setPayStatus("UNPAID");
        }
        if (entity.getTotalAmountCent() == null) {
            entity.setTotalAmountCent(0L);
        }
        if (entity.getPaidAmountCent() == null) {
            entity.setPaidAmountCent(0L);
        }
        if (StringUtils.isBlank(entity.getRefundStatus())) {
            entity.setRefundStatus("");
        }
        if (entity.getRefundAmountCent() == null) {
            entity.setRefundAmountCent(0L);
        }
        if (entity.getOrderAttributeJson() == null) {
            entity.setOrderAttributeJson("");
        }
    }

    private void applyOrderAttributeSnapshot(YyOrder order, List<org.dromara.yy.domain.bo.YyOrderAttributeValueBo> values) {
        String json = YyOrderAttributeSnapshotSupport.normalizeToJson(values);
        if (json != null) {
            order.setOrderAttributeJson(json);
        }
    }

    private void fillOrderAttributes(List<YyOrderVo> orders) {
        if (orders == null || orders.isEmpty()) {
            return;
        }
        for (YyOrderVo order : orders) {
            order.setOrderAttributes(YyOrderAttributeSnapshotSupport.parse(order.getOrderAttributeJson()));
        }
    }

    private void validateVerticalServiceOverlap(YyOrder order, Long excludeOrderId) {
        if (!isVerticalServiceGroup(order) || StringUtils.isBlank(order.getSlotDate())
            || StringUtils.isBlank(order.getSlotStartTime()) || StringUtils.isBlank(order.getSlotEndTime())
            || order.getStoreId() == null || order.getServiceGroupId() == null) {
            return;
        }
        int startMinutes = toMinutes(order.getSlotStartTime());
        int endMinutes = toMinutes(order.getSlotEndTime());
        if (!isValidRange(startMinutes, endMinutes)) {
            return;
        }
        List<YyOrder> sameDayOrders = baseMapper.selectList(Wrappers.<YyOrder>lambdaQuery()
            .eq(YyOrder::getStoreId, order.getStoreId())
            .eq(YyOrder::getServiceGroupId, order.getServiceGroupId())
            .eq(YyOrder::getSlotDate, order.getSlotDate())
            .ne(excludeOrderId != null, YyOrder::getId, excludeOrderId)
            .notIn(YyOrder::getStatus, List.of("CANCELLED", "REFUNDED"))
            .eq(YyOrder::getDelFlag, "0"));
        for (YyOrder existing : sameDayOrders) {
            int existingStart = toMinutes(existing.getSlotStartTime());
            int existingEnd = toMinutes(existing.getSlotEndTime());
            if (!isValidRange(existingStart, existingEnd)) {
                continue;
            }
            if (startMinutes < existingEnd && endMinutes > existingStart) {
                throw new ServiceException("纵向服务时段重叠，请改选其他时间");
            }
        }
    }

    private boolean isVerticalServiceGroup(YyOrder order) {
        if (order.getServiceGroupId() == null) {
            return false;
        }
        org.dromara.yy.domain.YyServiceGroup group = serviceGroupMapper.selectById(order.getServiceGroupId());
        return group != null && "VERTICAL".equalsIgnoreCase(StringUtils.trimToEmpty(group.getServiceMode()));
    }

    private static int toMinutes(String clock) {
        String text = StringUtils.trimToEmpty(clock);
        String[] parts = text.split(":");
        if (parts.length < 2) {
            return -1;
        }
        try {
            return Integer.parseInt(parts[0]) * 60 + Integer.parseInt(parts[1]);
        } catch (NumberFormatException ignored) {
            return -1;
        }
    }

    private static boolean isValidRange(int startMinutes, int endMinutes) {
        return startMinutes >= 0 && endMinutes > startMinutes;
    }

    private void syncCustomerOnCreate(YyOrder order) {
        if (StringUtils.isBlank(order.getCustomerPhone())) {
            return;
        }
        customerService.upsertByMobile(
            order.getCustomerName(),
            order.getCustomerPhone(),
            order.getSource(),
            BigDecimal.ZERO,
            order.getOrderTime(),
            "预约订单新增自动沉淀"
        );
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        if (isValid) {
            List<YyOrder> list = baseMapper.selectByIds(ids);
            if (list.size() != ids.size()) {
                throw new ServiceException("您没有删除权限!");
            }
        }
        return baseMapper.deleteByIds(ids) > 0;
    }

}
