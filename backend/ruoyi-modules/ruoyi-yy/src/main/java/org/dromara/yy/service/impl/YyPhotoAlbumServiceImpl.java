package org.dromara.yy.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.yy.domain.YyEmployee;
import org.dromara.yy.domain.YyEmployeeStore;
import org.dromara.yy.domain.YyPhotoAccessLog;
import org.dromara.yy.domain.YyPhotoAlbum;
import org.dromara.yy.domain.YyPhotoAsset;
import org.dromara.yy.domain.YyNotificationLog;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.bo.YyPhotoAlbumActionBo;
import org.dromara.yy.domain.bo.YyPhotoAlbumBo;
import org.dromara.yy.domain.vo.YyPhotoAlbumActionResultVo;
import org.dromara.yy.domain.vo.YyPhotoAlbumOperationsSummaryVo;
import org.dromara.yy.domain.vo.YyPhotoAlbumVo;
import org.dromara.yy.mapper.YyEmployeeMapper;
import org.dromara.yy.mapper.YyEmployeeStoreMapper;
import org.dromara.yy.mapper.YyPhotoAccessLogMapper;
import org.dromara.yy.mapper.YyPhotoAlbumMapper;
import org.dromara.yy.mapper.YyPhotoAssetMapper;
import org.dromara.yy.mapper.YyNotificationLogMapper;
import org.dromara.yy.service.IYyPhotoAlbumService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Collection;
import java.util.Comparator;
import java.util.Date;
import java.util.LinkedHashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

/**
 * 影约云相册Service业务层处理
 */
@Service
public class YyPhotoAlbumServiceImpl implements IYyPhotoAlbumService {

    private static final String DOUYIN_LIFE_CHANNEL = "DOUYIN_LIFE";
    private static final String MANUAL_CHANNEL = "MANUAL";
    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_DELIVERED = "DELIVERED";
    private static final String SELECTION_WAITING = "WAITING";
    private static final String SELECTION_SUBMITTED = "SUBMITTED";
    private static final String SELECTION_CONFIRMED = "CONFIRMED";
    private static final String SELECTION_DELIVERED = "DELIVERED";

    private final YyPhotoAlbumMapper baseMapper;
    private final YyPhotoAssetMapper photoAssetMapper;
    private final YyPhotoAccessLogMapper photoAccessLogMapper;
    private final YyNotificationLogMapper notificationLogMapper;
    private final YyEmployeeMapper employeeMapper;
    private final YyEmployeeStoreMapper employeeStoreMapper;

    @Autowired
    public YyPhotoAlbumServiceImpl(
        YyPhotoAlbumMapper baseMapper,
        YyPhotoAssetMapper photoAssetMapper,
        YyPhotoAccessLogMapper photoAccessLogMapper,
        YyNotificationLogMapper notificationLogMapper,
        YyEmployeeMapper employeeMapper,
        YyEmployeeStoreMapper employeeStoreMapper
    ) {
        this.baseMapper = baseMapper;
        this.photoAssetMapper = photoAssetMapper;
        this.photoAccessLogMapper = photoAccessLogMapper;
        this.notificationLogMapper = notificationLogMapper;
        this.employeeMapper = employeeMapper;
        this.employeeStoreMapper = employeeStoreMapper;
    }

    YyPhotoAlbumServiceImpl(
        YyPhotoAlbumMapper baseMapper,
        YyPhotoAssetMapper photoAssetMapper,
        YyPhotoAccessLogMapper photoAccessLogMapper,
        YyNotificationLogMapper notificationLogMapper
    ) {
        this(baseMapper, photoAssetMapper, photoAccessLogMapper, notificationLogMapper, null, null);
    }

    @Override
    public YyPhotoAlbumVo queryById(Long id) {
        YyPhotoAlbumVo vo = baseMapper.selectVoById(id);
        if (vo != null && !canAccessStore(vo.getStoreId())) {
            return null;
        }
        return vo;
    }

    @Override
    public TableDataInfo<YyPhotoAlbumVo> queryPageList(YyPhotoAlbumBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<YyPhotoAlbum> lqw = buildQueryWrapper(bo);
        Page<YyPhotoAlbumVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    @Override
    public List<YyPhotoAlbumVo> queryList(YyPhotoAlbumBo bo) {
        return baseMapper.selectVoList(buildQueryWrapper(bo));
    }

    @Override
    public List<YyPhotoAlbumOperationsSummaryVo> queryOperationsSummary(Collection<Long> albumIds) {
        List<Long> ids = albumIds == null ? List.of() : albumIds.stream()
            .filter(Objects::nonNull)
            .distinct()
            .toList();
        if (ids.isEmpty()) {
            return List.of();
        }

        ids = filterAccessibleAlbumIds(ids);
        if (ids.isEmpty()) {
            return List.of();
        }

        Map<Long, YyPhotoAlbumOperationsSummaryVo> summaryMap = new LinkedHashMap<>();
        ids.forEach(albumId -> summaryMap.put(albumId, initOperationsSummary(albumId)));

        List<YyPhotoAsset> assets = photoAssetMapper.selectList(Wrappers.<YyPhotoAsset>lambdaQuery()
            .in(YyPhotoAsset::getAlbumId, ids));
        for (YyPhotoAsset asset : assets) {
            YyPhotoAlbumOperationsSummaryVo summary = summaryMap.get(asset.getAlbumId());
            if (summary == null) {
                continue;
            }
            summary.setTotalAssets(summary.getTotalAssets() + 1);
            boolean visible = "1".equals(asset.getVisible());
            if (visible) {
                summary.setVisibleAssets(summary.getVisibleAssets() + 1);
                if (StringUtils.isBlank(asset.getObjectKey())) {
                    summary.setMissingObjectKeyAssets(summary.getMissingObjectKeyAssets() + 1);
                }
            }
            if ("1".equals(asset.getIsSelected())) {
                summary.setSelectedAssets(summary.getSelectedAssets() + 1);
            }
        }

        List<YyPhotoAccessLog> failedLogs = photoAccessLogMapper.selectList(Wrappers.<YyPhotoAccessLog>lambdaQuery()
            .in(YyPhotoAccessLog::getAlbumId, ids)
            .eq(YyPhotoAccessLog::getSuccess, "0"));
        failedLogs.stream()
            .filter(log -> summaryMap.containsKey(log.getAlbumId()))
            .sorted(Comparator
                .comparing(YyPhotoAccessLog::getCreateTime, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(YyPhotoAccessLog::getId, Comparator.nullsLast(Comparator.reverseOrder())))
            .forEach(log -> {
                YyPhotoAlbumOperationsSummaryVo summary = summaryMap.get(log.getAlbumId());
                if (summary.getRecentFailure() == null) {
                    summary.setRecentFailure(toRecentFailure(log));
                }
            });

        return List.copyOf(summaryMap.values());
    }

    @Override
    public YyPhotoAlbumActionResultVo confirmSelection(Long albumId, YyPhotoAlbumActionBo actionBo) {
        YyPhotoAlbum album = requireAlbum(albumId);
        String currentSelectionStatus = normalizeSelectionStatus(album.getSelectionStatus());
        if (SELECTION_DELIVERED.equals(currentSelectionStatus)) {
            return buildActionResult(album, "SELECTION_CONFIRM", "SUCCESS", false, "相册已交付，无需重复确认");
        }
        if (!SELECTION_SUBMITTED.equals(currentSelectionStatus) && !SELECTION_CONFIRMED.equals(currentSelectionStatus)) {
            throw new ServiceException("客户尚未提交可确认的选片结果");
        }
        album.setStatus(firstNotBlank(album.getStatus(), STATUS_ACTIVE));
        album.setSelectionStatus(SELECTION_CONFIRMED);
        album.setRemark(appendWorkflowRemark(album.getRemark(), "SELECTION_CONFIRM", actionBo));
        baseMapper.updateById(album);
        return buildActionResult(album, "SELECTION_CONFIRM", "SUCCESS", false, "客片确认完成");
    }

    @Override
    public YyPhotoAlbumActionResultVo deliverAlbum(Long albumId, YyPhotoAlbumActionBo actionBo) {
        YyPhotoAlbum album = requireAlbum(albumId);
        String currentSelectionStatus = normalizeSelectionStatus(album.getSelectionStatus());
        if (SELECTION_DELIVERED.equals(currentSelectionStatus) || STATUS_DELIVERED.equalsIgnoreCase(StringUtils.defaultIfBlank(album.getStatus(), ""))) {
            album.setStatus(STATUS_DELIVERED);
            album.setSelectionStatus(SELECTION_DELIVERED);
            return buildActionResult(album, "DELIVER", "SUCCESS", false, "相册已是最终交付状态");
        }
        if (!SELECTION_CONFIRMED.equals(currentSelectionStatus)) {
            throw new ServiceException("请先完成客片确认，再执行最终交付");
        }
        if (countDeliverableAssets(albumId) <= 0) {
            throw new ServiceException("当前相册没有可交付的客片资源");
        }
        album.setStatus(STATUS_DELIVERED);
        album.setSelectionStatus(SELECTION_DELIVERED);
        album.setRemark(appendWorkflowRemark(album.getRemark(), "DELIVER", actionBo));
        baseMapper.updateById(album);
        return buildActionResult(album, "DELIVER", "SUCCESS", false, "最终交付状态已记录");
    }

    @Override
    public YyPhotoAlbumActionResultVo notifyAlbum(Long albumId, YyPhotoAlbumActionBo actionBo) {
        YyPhotoAlbum album = requireAlbum(albumId);
        String channelType = StringUtils.upperCase(firstNotBlank(actionChannel(actionBo), MANUAL_CHANNEL));
        String receiver = firstNotBlank(actionReceiver(actionBo), album.getCustomerPhone(), album.getCustomerName(), "UNKNOWN");
        String requestId = "fallback-" + shortStableCode(albumId + ":" + channelType + ":" + System.currentTimeMillis());

        YyNotificationLog log = new YyNotificationLog();
        log.setStoreId(album.getStoreId());
        log.setOrderId(album.getOrderId());
        log.setChannelType(channelType);
        log.setReceiver(receiver);
        log.setSendStatus("FALLBACK");
        log.setRequestId(requestId);
        log.setErrorMessage("通知通道未接入，已记录人工跟进日志");
        log.setSentTime(new Date());
        log.setRawPayload(buildNotificationPayload(album, channelType, receiver, actionBo, requestId));
        log.setRemark(firstNotBlank(actionRemark(actionBo), "通知通道未接入，已记录 fallback 审计"));
        log.setDelFlag("0");
        notificationLogMapper.insert(log);

        YyPhotoAlbumActionResultVo result = buildActionResult(album, "NOTIFY", "FALLBACK_LOGGED", true, "通知通道未接入，已记录可审计 fallback 日志");
        result.setNotificationChannel(channelType);
        result.setNotificationSendStatus("FALLBACK");
        result.setRequestId(requestId);
        return result;
    }

    @Override
    public YyPhotoAlbumVo upsertPlaceholderForOrder(YyOrder order, String channelType, String externalOrderId, String bookId, String certificateCode) {
        if (order == null || order.getId() == null) {
            throw new ServiceException("订单不存在，无法生成取片相册");
        }
        if (order.getStoreId() == null) {
            throw new ServiceException("订单缺门店ID，无法生成取片相册");
        }
        if (StringUtils.isBlank(order.getCustomerPhone())) {
            throw new ServiceException("订单缺客户手机号，无法生成取片相册");
        }

        String resolvedChannelType = firstNotBlank(channelType, order.getSource(), "MANUAL");
        String resolvedExternalOrderId = firstNotBlank(externalOrderId, order.getExternalOrderId(), order.getOrderNo(), String.valueOf(order.getId()));
        YyPhotoAlbum album = queryPlaceholderAlbum(order.getId(), resolvedChannelType, resolvedExternalOrderId);
        boolean isNew = album == null;
        if (album == null) {
            album = new YyPhotoAlbum();
            album.setChannelType(resolvedChannelType);
            album.setStatus(STATUS_ACTIVE);
            album.setSelectionStatus(SELECTION_WAITING);
            album.setPublicToken(buildPublicToken(resolvedChannelType, resolvedExternalOrderId, order.getId()));
            album.setAccessCode("PICK-" + shortStableCode(resolvedChannelType + ":" + resolvedExternalOrderId + ":" + order.getId()));
            album.setExpireTime(new Date(System.currentTimeMillis() + Duration.ofDays(30).toMillis()));
            album.setDelFlag("0");
            album.setRemark("订单取片相册占位，等待上传客片");
        }

        album.setStoreId(firstNonNull(album.getStoreId(), order.getStoreId()));
        album.setOrderId(firstNonNull(album.getOrderId(), order.getId()));
        album.setAlbumName(firstNotBlank(album.getAlbumName(), buildPhotoAlbumName(order, resolvedChannelType)));
        album.setCustomerName(firstNotBlank(album.getCustomerName(), order.getCustomerName()));
        album.setCustomerPhone(firstNotBlank(album.getCustomerPhone(), order.getCustomerPhone()));
        album.setChannelType(firstNotBlank(album.getChannelType(), resolvedChannelType));
        album.setStatus(firstNotBlank(album.getStatus(), STATUS_ACTIVE));
        album.setSelectionStatus(firstNotBlank(album.getSelectionStatus(), SELECTION_WAITING));
        album.setPublicToken(firstNotBlank(album.getPublicToken(), buildPublicToken(resolvedChannelType, resolvedExternalOrderId, order.getId())));
        album.setAccessCode(firstNotBlank(album.getAccessCode(), "PICK-" + shortStableCode(resolvedChannelType + ":" + resolvedExternalOrderId + ":" + order.getId())));
        album.setExpireTime(album.getExpireTime() == null ? new Date(System.currentTimeMillis() + Duration.ofDays(30).toMillis()) : album.getExpireTime());
        album.setDelFlag(firstNotBlank(album.getDelFlag(), "0"));
        if (DOUYIN_LIFE_CHANNEL.equals(resolvedChannelType) && StringUtils.isNotBlank(resolvedExternalOrderId)) {
            album.setDouyinOrderId(firstNotBlank(album.getDouyinOrderId(), resolvedExternalOrderId));
        }
        if (StringUtils.isNotBlank(bookId)) {
            album.setBookId(bookId);
        }
        if (StringUtils.isNotBlank(certificateCode)) {
            album.setCertificateCode(certificateCode);
        }

        if (isNew) {
            baseMapper.insert(album);
        } else {
            baseMapper.updateById(album);
        }
        return BeanUtil.toBean(album, YyPhotoAlbumVo.class);
    }

    private YyPhotoAlbum queryPlaceholderAlbum(Long orderId, String channelType, String externalOrderId) {
        if (DOUYIN_LIFE_CHANNEL.equals(channelType) && StringUtils.isNotBlank(externalOrderId)) {
            YyPhotoAlbum album = baseMapper.selectOne(Wrappers.<YyPhotoAlbum>lambdaQuery()
                .eq(YyPhotoAlbum::getChannelType, channelType)
                .eq(YyPhotoAlbum::getDouyinOrderId, externalOrderId)
                .eq(YyPhotoAlbum::getDelFlag, "0")
                .orderByDesc(YyPhotoAlbum::getId)
                .last("limit 1"));
            if (album != null) {
                return album;
            }
        }
        return baseMapper.selectOne(Wrappers.<YyPhotoAlbum>lambdaQuery()
            .eq(YyPhotoAlbum::getOrderId, orderId)
            .eq(YyPhotoAlbum::getDelFlag, "0")
            .orderByDesc(YyPhotoAlbum::getId)
            .last("limit 1"));
    }

    private YyPhotoAlbum requireAlbum(Long albumId) {
        if (albumId == null) {
            throw new ServiceException("相册ID不能为空");
        }
        YyPhotoAlbum album = baseMapper.selectById(albumId);
        if (album == null || "1".equals(album.getDelFlag())) {
            throw new ServiceException("相册不存在");
        }
        if (!canAccessStore(album.getStoreId())) {
            throw new ServiceException("无权操作该门店相册");
        }
        return album;
    }

    private long countDeliverableAssets(Long albumId) {
        List<YyPhotoAsset> assets = photoAssetMapper.selectList(Wrappers.<YyPhotoAsset>lambdaQuery()
            .eq(YyPhotoAsset::getAlbumId, albumId)
            .orderByAsc(YyPhotoAsset::getSort)
            .orderByAsc(YyPhotoAsset::getId));
        boolean hasSelected = assets.stream().anyMatch(asset -> "1".equals(asset.getIsSelected()));
        return assets.stream()
            .filter(asset -> "1".equals(asset.getVisible()))
            .filter(asset -> StringUtils.isNotBlank(asset.getObjectKey()))
            .filter(asset -> !hasSelected || "1".equals(asset.getIsSelected()))
            .count();
    }

    private LambdaQueryWrapper<YyPhotoAlbum> buildQueryWrapper(YyPhotoAlbumBo bo) {
        LambdaQueryWrapper<YyPhotoAlbum> lqw = Wrappers.lambdaQuery();
        if (bo == null) {
            applyStoreScope(lqw, null);
            lqw.orderByDesc(YyPhotoAlbum::getId);
            return lqw;
        }
        lqw.eq(bo.getStoreId() != null, YyPhotoAlbum::getStoreId, bo.getStoreId());
        lqw.eq(bo.getOrderId() != null, YyPhotoAlbum::getOrderId, bo.getOrderId());
        lqw.like(StringUtils.isNotBlank(bo.getAlbumName()), YyPhotoAlbum::getAlbumName, bo.getAlbumName());
        lqw.eq(StringUtils.isNotBlank(bo.getSelectionStatus()), YyPhotoAlbum::getSelectionStatus, bo.getSelectionStatus());
        applyStoreScope(lqw, bo.getStoreId());
        lqw.orderByDesc(YyPhotoAlbum::getId);
        return lqw;
    }

    private YyPhotoAlbumOperationsSummaryVo initOperationsSummary(Long albumId) {
        YyPhotoAlbumOperationsSummaryVo summary = new YyPhotoAlbumOperationsSummaryVo();
        summary.setAlbumId(albumId);
        summary.setTotalAssets(0L);
        summary.setVisibleAssets(0L);
        summary.setSelectedAssets(0L);
        summary.setMissingObjectKeyAssets(0L);
        return summary;
    }

    private YyPhotoAlbumOperationsSummaryVo.RecentFailureVo toRecentFailure(YyPhotoAccessLog log) {
        YyPhotoAlbumOperationsSummaryVo.RecentFailureVo recentFailure = new YyPhotoAlbumOperationsSummaryVo.RecentFailureVo();
        recentFailure.setAction(log.getAction());
        recentFailure.setRemark(log.getRemark());
        recentFailure.setCreateTime(log.getCreateTime());
        return recentFailure;
    }

    @Override
    public Boolean insertByBo(YyPhotoAlbumBo bo) {
        YyPhotoAlbum add = BeanUtil.toBean(bo, YyPhotoAlbum.class);
        if (!canAccessStore(add.getStoreId())) {
            throw new ServiceException("无权操作该门店相册");
        }
        validEntityBeforeSave(add);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(YyPhotoAlbumBo bo) {
        if (bo == null || bo.getId() == null) {
            throw new ServiceException("相册ID不能为空");
        }
        YyPhotoAlbum existing = baseMapper.selectById(bo.getId());
        if (existing == null || "1".equals(existing.getDelFlag())) {
            throw new ServiceException("相册不存在");
        }
        if (!canAccessStore(existing.getStoreId()) || !canAccessStore(bo.getStoreId())) {
            throw new ServiceException("无权操作该门店相册");
        }
        YyPhotoAlbum update = BeanUtil.toBean(bo, YyPhotoAlbum.class);
        validEntityBeforeSave(update);
        return baseMapper.updateById(update) > 0;
    }

    private void validEntityBeforeSave(YyPhotoAlbum entity) {
        // 预留唯一性、渠道授权、订单状态流转等业务校验。
    }

    private String normalizeSelectionStatus(String selectionStatus) {
        return StringUtils.upperCase(StringUtils.defaultIfBlank(selectionStatus, SELECTION_WAITING));
    }

    private YyPhotoAlbumActionResultVo buildActionResult(
        YyPhotoAlbum album,
        String action,
        String auditStatus,
        boolean fallback,
        String message
    ) {
        YyPhotoAlbumActionResultVo result = new YyPhotoAlbumActionResultVo();
        result.setAlbumId(album.getId());
        result.setAction(action);
        result.setStatus(firstNotBlank(album.getStatus(), STATUS_ACTIVE));
        result.setSelectionStatus(firstNotBlank(album.getSelectionStatus(), SELECTION_WAITING));
        result.setAuditStatus(auditStatus);
        result.setFallback(fallback);
        result.setMessage(message);
        return result;
    }

    private String appendWorkflowRemark(String currentRemark, String action, YyPhotoAlbumActionBo actionBo) {
        String nextRemark = StringUtils.trimToEmpty(actionRemark(actionBo));
        if (StringUtils.isBlank(nextRemark)) {
            return currentRemark;
        }
        String line = "[" + action + "] " + nextRemark;
        if (StringUtils.isBlank(currentRemark)) {
            return line;
        }
        return currentRemark + "\n" + line;
    }

    private String buildNotificationPayload(
        YyPhotoAlbum album,
        String channelType,
        String receiver,
        YyPhotoAlbumActionBo actionBo,
        String requestId
    ) {
        return "{"
            + "\"action\":\"NOTIFY\""
            + ",\"albumId\":" + album.getId()
            + ",\"orderId\":" + String.valueOf(album.getOrderId())
            + ",\"channelType\":\"" + escapeJson(channelType) + "\""
            + ",\"receiver\":\"" + escapeJson(receiver) + "\""
            + ",\"requestId\":\"" + escapeJson(requestId) + "\""
            + ",\"remark\":\"" + escapeJson(actionRemark(actionBo)) + "\""
            + ",\"fallback\":true"
            + "}";
    }

    private String actionChannel(YyPhotoAlbumActionBo actionBo) {
        return actionBo == null ? "" : actionBo.getChannelType();
    }

    private String actionReceiver(YyPhotoAlbumActionBo actionBo) {
        return actionBo == null ? "" : actionBo.getReceiver();
    }

    private String actionRemark(YyPhotoAlbumActionBo actionBo) {
        return actionBo == null ? "" : actionBo.getRemark();
    }

    private String escapeJson(String value) {
        return StringUtils.trimToEmpty(value).replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private String buildPhotoAlbumName(YyOrder order, String channelType) {
        String customerName = firstNotBlank(order.getCustomerName(), DOUYIN_LIFE_CHANNEL.equals(channelType) ? "抖音来客客户" : "客户");
        String sourceLabel = DOUYIN_LIFE_CHANNEL.equals(channelType) ? "抖音订单" : "订单";
        return customerName + "的" + sourceLabel + "取片相册";
    }

    private String buildPublicToken(String channelType, String externalOrderId, Long orderId) {
        String prefix = DOUYIN_LIFE_CHANNEL.equals(channelType) ? "dy-life-" : "order-";
        return prefix + stableUuid(channelType + ":" + firstNotBlank(externalOrderId, String.valueOf(orderId)));
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

    private String shortStableCode(String seed) {
        String compact = stableUuid(seed).replace("-", "").toUpperCase(Locale.ROOT);
        return compact.length() <= 8 ? compact : compact.substring(0, 8);
    }

    private String stableUuid(String seed) {
        return UUID.nameUUIDFromBytes(firstNotBlank(seed, "yy-photo-album").getBytes(StandardCharsets.UTF_8)).toString();
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        if (isValid) {
            List<YyPhotoAlbum> list = baseMapper.selectByIds(ids);
            if (list.size() != ids.size() || list.stream().anyMatch(album -> !canAccessStore(album.getStoreId()))) {
                throw new ServiceException("您没有删除权限!");
            }
        }
        return baseMapper.deleteByIds(ids) > 0;
    }

    private List<Long> filterAccessibleAlbumIds(List<Long> ids) {
        StoreScope storeScope = resolveCurrentStoreScope();
        if (!storeScope.applicable() || storeScope.globalScope()) {
            return ids;
        }
        if (storeScope.storeIds().isEmpty()) {
            return List.of();
        }
        Set<Long> accessibleIds = baseMapper.selectList(Wrappers.<YyPhotoAlbum>lambdaQuery()
                .select(YyPhotoAlbum::getId)
                .in(YyPhotoAlbum::getId, ids)
                .in(YyPhotoAlbum::getStoreId, storeScope.storeIds()))
            .stream()
            .map(YyPhotoAlbum::getId)
            .filter(Objects::nonNull)
            .collect(java.util.stream.Collectors.toSet());
        return ids.stream()
            .filter(accessibleIds::contains)
            .toList();
    }

    private void applyStoreScope(LambdaQueryWrapper<YyPhotoAlbum> lqw, Long requestedStoreId) {
        StoreScope storeScope = resolveCurrentStoreScope();
        if (!storeScope.applicable() || storeScope.globalScope()) {
            lqw.eq(requestedStoreId != null, YyPhotoAlbum::getStoreId, requestedStoreId);
            return;
        }

        Set<Long> scopedStoreIds = storeScope.storeIds();
        if (scopedStoreIds.isEmpty()) {
            lqw.apply("1 = 0");
            return;
        }
        if (requestedStoreId == null) {
            lqw.in(YyPhotoAlbum::getStoreId, scopedStoreIds);
            return;
        }
        if (scopedStoreIds.contains(requestedStoreId)) {
            lqw.eq(YyPhotoAlbum::getStoreId, requestedStoreId);
            return;
        }
        lqw.apply("1 = 0");
    }

    private boolean canAccessStore(Long storeId) {
        StoreScope storeScope = resolveCurrentStoreScope();
        return !storeScope.applicable()
            || storeScope.globalScope()
            || (storeId != null && storeScope.storeIds().contains(storeId));
    }

    private StoreScope resolveCurrentStoreScope() {
        if (!LoginHelper.isLogin()) {
            return StoreScope.notApplicable();
        }
        if (LoginHelper.isSuperAdmin() || LoginHelper.isTenantAdmin()) {
            return StoreScope.global();
        }
        if (employeeMapper == null) {
            return StoreScope.empty();
        }
        LoginUser loginUser = LoginHelper.getLoginUser();
        if (loginUser == null || loginUser.getUserId() == null) {
            return StoreScope.empty();
        }
        YyEmployee employee = employeeMapper.selectOne(Wrappers.lambdaQuery(YyEmployee.class)
            .eq(YyEmployee::getUserId, loginUser.getUserId())
            .eq(YyEmployee::getStatus, "0")
            .last("limit 1"));
        if (employee == null) {
            return StoreScope.empty();
        }
        LinkedHashSet<Long> storeIds = new LinkedHashSet<>();
        if (employeeStoreMapper != null && employee.getId() != null) {
            List<YyEmployeeStore> employeeStores = employeeStoreMapper.selectList(
                Wrappers.<YyEmployeeStore>lambdaQuery()
                    .eq(YyEmployeeStore::getEmployeeId, employee.getId())
                    .eq(YyEmployeeStore::getDelFlag, "0")
                    .orderByAsc(YyEmployeeStore::getSort)
                    .orderByAsc(YyEmployeeStore::getId));
            employeeStores.stream()
                .map(YyEmployeeStore::getStoreId)
                .filter(Objects::nonNull)
                .forEach(storeIds::add);
        }
        if (storeIds.isEmpty() && employee.getStoreId() != null) {
            storeIds.add(employee.getStoreId());
        }
        return StoreScope.limited(storeIds);
    }

    private record StoreScope(boolean applicable, boolean globalScope, Set<Long> storeIds) {
        private static StoreScope notApplicable() {
            return new StoreScope(false, false, Set.of());
        }

        private static StoreScope global() {
            return new StoreScope(true, true, Set.of());
        }

        private static StoreScope empty() {
            return new StoreScope(true, false, Set.of());
        }

        private static StoreScope limited(Collection<Long> storeIds) {
            return new StoreScope(true, false, Set.copyOf(storeIds));
        }
    }
}
