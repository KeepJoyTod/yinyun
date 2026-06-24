package org.dromara.yy.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.dromara.common.core.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.YyChannelEventInbox;
import org.dromara.yy.domain.bo.YyChannelEventInboxBo;
import org.dromara.yy.domain.vo.YyChannelEventInboxStatusVo;
import org.dromara.yy.domain.vo.YyChannelEventInboxVo;
import org.dromara.yy.mapper.YyChannelEventInboxMapper;
import org.dromara.yy.service.IYyChannelEventInboxService;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;

/**
 * 渠道事件收件箱业务处理。
 */
@RequiredArgsConstructor
@Service
public class YyChannelEventInboxServiceImpl implements IYyChannelEventInboxService {

    private static final int MAX_PAYLOAD_LENGTH = 4000;
    private static final int MAX_ERROR_LENGTH = 1000;
    private static final int MAX_CLAIM_LIMIT = 100;

    private final YyChannelEventInboxMapper baseMapper;

    @Override
    public YyChannelEventInboxVo queryById(Long id) {
        return baseMapper.selectVoById(id);
    }

    @Override
    public TableDataInfo<YyChannelEventInboxVo> queryPageList(YyChannelEventInboxBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<YyChannelEventInbox> lqw = buildQueryWrapper(bo);
        Page<YyChannelEventInboxVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    @Override
    public List<YyChannelEventInboxVo> queryList(YyChannelEventInboxBo bo) {
        return baseMapper.selectVoList(buildQueryWrapper(bo));
    }

    @Override
    public YyChannelEventInboxStatusVo queryStatus(String channelType) {
        String normalizedChannel = normalize(channelType, "DOUYIN_LIFE");
        YyChannelEventInbox latest = baseMapper.selectOne(Wrappers.<YyChannelEventInbox>lambdaQuery()
            .eq(YyChannelEventInbox::getChannelType, normalizedChannel)
            .orderByDesc(YyChannelEventInbox::getCreateTime)
            .orderByDesc(YyChannelEventInbox::getId)
            .last("limit 1"));

        long total = countByStatus(normalizedChannel, null);
        long received = countByStatus(normalizedChannel, "RECEIVED");
        long processed = countByStatus(normalizedChannel, "PROCESSED");
        long done = countByStatus(normalizedChannel, "DONE");
        long failed = countByStatus(normalizedChannel, "FAILED");
        long retry = countByStatus(normalizedChannel, "RETRY");
        long dead = countByStatus(normalizedChannel, "DEAD");

        YyChannelEventInboxStatusVo status = new YyChannelEventInboxStatusVo();
        status.setChannelType(normalizedChannel);
        status.setTotalCount(total);
        status.setReceivedCount(received);
        status.setProcessedCount(processed + done);
        status.setFailedCount(failed);
        status.setDeadCount(dead);
        status.setRetryableCount(received + failed + retry);
        if (latest != null) {
            status.setLatestEventId(latest.getEventId());
            status.setLatestEventType(latest.getEventType());
            status.setLatestExternalOrderId(latest.getExternalOrderId());
            status.setLatestRequestId(latest.getRequestId());
            status.setLatestProcessStatus(latest.getProcessStatus());
            status.setLatestErrorMessage(latest.getErrorMessage());
            status.setLatestEventTime(latest.getCreateTime());
            status.setLatestProcessedTime(latest.getProcessedTime());
        }
        return status;
    }

    @Override
    public List<YyChannelEventInboxVo> claimPendingEvents(String channelType, int limit) {
        String normalizedChannel = normalize(channelType, "DOUYIN_LIFE");
        int claimLimit = Math.max(1, Math.min(limit, MAX_CLAIM_LIMIT));
        return baseMapper.claimPendingEvents(normalizedChannel, claimLimit)
            .stream()
            .map(entity -> BeanUtil.toBean(entity, YyChannelEventInboxVo.class))
            .toList();
    }

    @Override
    public YyChannelEventInboxVo receiveEvent(
        String channelType,
        String eventType,
        String externalOrderId,
        String requestId,
        String rawPayload,
        boolean signatureValid,
        String errorMessage
    ) {
        String normalizedChannel = normalize(channelType, "UNKNOWN");
        String normalizedEvent = normalize(eventType, "UNKNOWN_EVENT");
        String normalizedExternalOrderId = StringUtils.trimToEmpty(externalOrderId);
        String normalizedRequestId = StringUtils.trimToEmpty(requestId);
        String eventId = buildEventId(normalizedChannel, normalizedEvent, normalizedExternalOrderId, normalizedRequestId, rawPayload);

        YyChannelEventInbox existing = findExisting(normalizedChannel, normalizedEvent, eventId);
        if (existing != null) {
            return toVo(existing, isDuplicate(existing) ? "DUPLICATE" : existing.getProcessStatus());
        }

        YyChannelEventInbox entity = new YyChannelEventInbox();
        entity.setChannelType(normalizedChannel);
        entity.setEventType(normalizedEvent);
        entity.setEventId(eventId);
        entity.setExternalOrderId(normalizedExternalOrderId);
        entity.setRequestId(normalizedRequestId);
        entity.setSignatureValid(signatureValid ? "1" : "0");
        entity.setProcessStatus(signatureValid ? "RECEIVED" : "FAILED");
        entity.setRetryCount(0);
        entity.setRawPayload(limitText(redactSensitivePayload(rawPayload), MAX_PAYLOAD_LENGTH));
        entity.setErrorMessage(limitText(errorMessage, MAX_ERROR_LENGTH));
        if (!signatureValid) {
            entity.setProcessedTime(new Date());
        }
        try {
            baseMapper.insert(entity);
            return BeanUtil.toBean(entity, YyChannelEventInboxVo.class);
        } catch (DuplicateKeyException ex) {
            YyChannelEventInbox duplicate = findExisting(normalizedChannel, normalizedEvent, eventId);
            return toVo(duplicate, duplicate != null && isDuplicate(duplicate) ? "DUPLICATE" : duplicate == null ? "RECEIVED" : duplicate.getProcessStatus());
        }
    }

    @Override
    public void markProcessed(Long id, String remark) {
        if (id == null) {
            return;
        }
        YyChannelEventInbox update = new YyChannelEventInbox();
        update.setId(id);
        update.setProcessStatus("PROCESSED");
        update.setProcessedTime(new Date());
        update.setRemark(limitText(remark, MAX_ERROR_LENGTH));
        update.setErrorMessage("");
        baseMapper.updateById(update);
    }

    @Override
    public void markFailed(Long id, String errorMessage) {
        if (id == null) {
            return;
        }
        YyChannelEventInbox current = baseMapper.selectById(id);
        YyChannelEventInbox update = new YyChannelEventInbox();
        update.setId(id);
        update.setProcessStatus("FAILED");
        update.setProcessedTime(new Date());
        update.setRetryCount(current == null || current.getRetryCount() == null ? 1 : current.getRetryCount() + 1);
        update.setErrorMessage(limitText(errorMessage, MAX_ERROR_LENGTH));
        baseMapper.updateById(update);
    }

    @Override
    public void markDone(Long id, String remark) {
        if (id == null) {
            return;
        }
        YyChannelEventInbox update = new YyChannelEventInbox();
        update.setId(id);
        update.setProcessStatus("DONE");
        update.setProcessedTime(new Date());
        update.setRemark(limitText(remark, MAX_ERROR_LENGTH));
        update.setErrorMessage("");
        baseMapper.updateById(update);
    }

    @Override
    public void markRetry(Long id, String errorMessage, Date nextRetryTime) {
        if (id == null) {
            return;
        }
        YyChannelEventInbox current = baseMapper.selectById(id);
        YyChannelEventInbox update = new YyChannelEventInbox();
        update.setId(id);
        update.setProcessStatus("RETRY");
        update.setRetryCount(current == null || current.getRetryCount() == null ? 1 : current.getRetryCount() + 1);
        update.setNextRetryTime(nextRetryTime == null ? new Date() : nextRetryTime);
        update.setErrorMessage(limitText(errorMessage, MAX_ERROR_LENGTH));
        baseMapper.updateById(update);
    }

    @Override
    public void markDead(Long id, String errorMessage) {
        if (id == null) {
            return;
        }
        YyChannelEventInbox update = new YyChannelEventInbox();
        update.setId(id);
        update.setProcessStatus("DEAD");
        update.setProcessedTime(new Date());
        update.setErrorMessage(limitText(errorMessage, MAX_ERROR_LENGTH));
        baseMapper.updateById(update);
    }

    @Override
    public YyChannelEventInboxVo retryEvent(Long id, String remark) {
        if (id == null) {
            throw new ServiceException("事件 ID 不能为空");
        }
        YyChannelEventInbox current = baseMapper.selectById(id);
        if (current == null) {
            throw new ServiceException("事件不存在或已删除");
        }
        YyChannelEventInbox update = new YyChannelEventInbox();
        update.setId(id);
        update.setProcessStatus("RECEIVED");
        update.setRetryCount(current.getRetryCount() == null ? 1 : current.getRetryCount() + 1);
        update.setNextRetryTime(new Date());
        update.setErrorMessage("");
        update.setRemark(limitText(firstNotBlank(remark, "管理员手动重试"), MAX_ERROR_LENGTH));
        baseMapper.updateById(update);
        return baseMapper.selectVoById(id);
    }

    private LambdaQueryWrapper<YyChannelEventInbox> buildQueryWrapper(YyChannelEventInboxBo bo) {
        LambdaQueryWrapper<YyChannelEventInbox> lqw = Wrappers.lambdaQuery();
        if (bo == null) {
            bo = new YyChannelEventInboxBo();
        }
        lqw.eq(bo.getId() != null, YyChannelEventInbox::getId, bo.getId());
        lqw.eq(StringUtils.isNotBlank(bo.getChannelType()), YyChannelEventInbox::getChannelType, normalize(bo.getChannelType(), ""));
        lqw.eq(StringUtils.isNotBlank(bo.getEventType()), YyChannelEventInbox::getEventType, normalize(bo.getEventType(), ""));
        lqw.like(StringUtils.isNotBlank(bo.getEventId()), YyChannelEventInbox::getEventId, bo.getEventId());
        lqw.like(StringUtils.isNotBlank(bo.getExternalOrderId()), YyChannelEventInbox::getExternalOrderId, bo.getExternalOrderId());
        lqw.like(StringUtils.isNotBlank(bo.getRequestId()), YyChannelEventInbox::getRequestId, bo.getRequestId());
        lqw.eq(StringUtils.isNotBlank(bo.getSignatureValid()), YyChannelEventInbox::getSignatureValid, bo.getSignatureValid());
        lqw.eq(StringUtils.isNotBlank(bo.getProcessStatus()), YyChannelEventInbox::getProcessStatus, normalize(bo.getProcessStatus(), ""));
        lqw.orderByDesc(YyChannelEventInbox::getCreateTime);
        lqw.orderByDesc(YyChannelEventInbox::getId);
        return lqw;
    }

    private long countByStatus(String channelType, String processStatus) {
        Long count = baseMapper.selectCount(Wrappers.<YyChannelEventInbox>lambdaQuery()
            .eq(YyChannelEventInbox::getChannelType, channelType)
            .eq(StringUtils.isNotBlank(processStatus), YyChannelEventInbox::getProcessStatus, processStatus));
        return count == null ? 0L : count;
    }

    private YyChannelEventInbox findExisting(String channelType, String eventType, String eventId) {
        if (StringUtils.isBlank(eventId)) {
            return null;
        }
        LambdaQueryWrapper<YyChannelEventInbox> query = Wrappers.<YyChannelEventInbox>lambdaQuery()
            .eq(YyChannelEventInbox::getChannelType, channelType)
            .eq(YyChannelEventInbox::getEventType, eventType)
            .eq(YyChannelEventInbox::getEventId, eventId)
            .last("limit 1");
        return baseMapper.selectOne(query);
    }

    private static boolean isDuplicate(YyChannelEventInbox entity) {
        return entity != null && ("PROCESSED".equals(entity.getProcessStatus()) || "DONE".equals(entity.getProcessStatus()));
    }

    private static YyChannelEventInboxVo toVo(YyChannelEventInbox entity, String statusOverride) {
        if (entity == null) {
            YyChannelEventInboxVo vo = new YyChannelEventInboxVo();
            vo.setProcessStatus(statusOverride);
            return vo;
        }
        YyChannelEventInboxVo vo = BeanUtil.toBean(entity, YyChannelEventInboxVo.class);
        vo.setProcessStatus(statusOverride);
        return vo;
    }

    private static String buildEventId(String channelType, String eventType, String externalOrderId, String requestId, String rawPayload) {
        String businessKey = firstNotBlank(externalOrderId, requestId, sha256HexLower(StringUtils.trimToEmpty(rawPayload)));
        String stableKey = String.join("|",
            StringUtils.trimToEmpty(channelType),
            StringUtils.trimToEmpty(eventType),
            businessKey
        );
        return sha256HexLower(stableKey);
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

    private static String normalize(String value, String fallback) {
        String normalized = StringUtils.trimToEmpty(value);
        return StringUtils.isBlank(normalized) ? fallback : normalized.toUpperCase(Locale.ROOT);
    }

    private static String redactSensitivePayload(String payload) {
        if (StringUtils.isBlank(payload)) {
            return "";
        }
        return payload.replaceAll(
            "(?i)(\"(?:client_secret|client_access_token|access_token|refresh_token|open_id|openid|mobile|phone|encrypt_mobile|receiver_phone|customer_phone|buyer_phone)\"\\s*:\\s*\")[^\"]+(\")",
            "$1***$2"
        );
    }

    private static String limitText(String value, int maxLength) {
        if (StringUtils.isBlank(value)) {
            return "";
        }
        return value.length() <= maxLength ? value : value.substring(0, maxLength);
    }

    private static String sha256HexLower(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8))).toLowerCase(Locale.ROOT);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 not available", ex);
        }
    }
}
