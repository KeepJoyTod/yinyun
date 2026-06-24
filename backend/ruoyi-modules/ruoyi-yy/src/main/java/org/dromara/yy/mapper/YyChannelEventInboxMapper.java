package org.dromara.yy.mapper;

import org.dromara.common.mybatis.core.mapper.BaseMapperPlus;
import org.dromara.yy.domain.YyChannelEventInbox;
import org.dromara.yy.domain.vo.YyChannelEventInboxVo;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 渠道事件收件箱 Mapper。
 */
public interface YyChannelEventInboxMapper extends BaseMapperPlus<YyChannelEventInbox, YyChannelEventInboxVo> {

    List<YyChannelEventInbox> claimPendingEvents(@Param("channelType") String channelType, @Param("limit") int limit);
}
