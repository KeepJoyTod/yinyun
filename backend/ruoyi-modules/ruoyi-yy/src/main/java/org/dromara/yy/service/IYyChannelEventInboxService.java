package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyChannelEventInboxBo;
import org.dromara.yy.domain.vo.YyChannelEventInboxStatusVo;
import org.dromara.yy.domain.vo.YyChannelEventInboxVo;

import java.util.List;
import java.util.Date;

/**
 * 渠道事件收件箱 Service 接口。
 */
public interface IYyChannelEventInboxService {

    YyChannelEventInboxVo queryById(Long id);

    TableDataInfo<YyChannelEventInboxVo> queryPageList(YyChannelEventInboxBo bo, PageQuery pageQuery);

    List<YyChannelEventInboxVo> queryList(YyChannelEventInboxBo bo);

    YyChannelEventInboxStatusVo queryStatus(String channelType);

    List<YyChannelEventInboxVo> claimPendingEvents(String channelType, int limit);

    YyChannelEventInboxVo receiveEvent(
        String channelType,
        String eventType,
        String externalOrderId,
        String requestId,
        String rawPayload,
        boolean signatureValid,
        String errorMessage
    );

    void markProcessed(Long id, String remark);

    void markFailed(Long id, String errorMessage);

    void markDone(Long id, String remark);

    void markRetry(Long id, String errorMessage, Date nextRetryTime);

    void markDead(Long id, String errorMessage);

    YyChannelEventInboxVo retryEvent(Long id, String remark);
}
