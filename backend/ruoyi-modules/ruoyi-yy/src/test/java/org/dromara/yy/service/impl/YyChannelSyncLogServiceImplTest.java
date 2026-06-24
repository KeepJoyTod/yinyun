package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.ibatis.session.Configuration;
import org.dromara.yy.domain.YyChannelSyncLog;
import org.dromara.yy.domain.vo.YyChannelAcceptanceCaseVo;
import org.dromara.yy.domain.vo.YyChannelAutoSyncStatusVo;
import org.dromara.yy.domain.vo.YyChannelSyncLogVo;
import org.dromara.yy.mapper.YyChannelSyncLogMapper;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class YyChannelSyncLogServiceImplTest {

    @Mock
    private YyChannelSyncLogMapper channelSyncLogMapper;

    @InjectMocks
    private YyChannelSyncLogServiceImpl service;

    @Tag("dev")
    @Test
    void queryAcceptanceCasesShouldMatchLatestLogidByApiName() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyChannelSyncLog.class);

        YyChannelSyncLogVo older = syncLog("tripartite_code_create", "older-logid", "1", 1780840000000L);
        YyChannelSyncLogVo latest = syncLog("tripartite_code_create", "latest-logid", "1", 1780841000000L);
        when(channelSyncLogMapper.selectVoList(any())).thenReturn(List.of(older, latest));

        List<YyChannelAcceptanceCaseVo> cases = service.queryAcceptanceCases("DOUYIN_LIFE");

        YyChannelAcceptanceCaseVo issueCode = cases.stream()
            .filter(item -> "tripartite_code_create".equals(item.getCaseKey()))
            .findFirst()
            .orElseThrow();
        assertEquals("READY", issueCode.getStatus());
        assertEquals("latest-logid", issueCode.getRequestId());
        assertEquals("https://api.evanshine.me/api/douyin/life/tripartite-code/create", issueCode.getPublicUrl());

        YyChannelAcceptanceCaseVo refundApply = cases.stream()
            .filter(item -> "refund_apply".equals(item.getCaseKey()))
            .findFirst()
            .orElseThrow();
        assertEquals("WAITING", refundApply.getStatus());
        assertTrue(refundApply.getHint().contains("退款"));
    }

    @Tag("dev")
    @Test
    void queryAutoSyncStatusShouldExposeLatestAutoSyncLog() {
        YyChannelSyncLogVo latest = syncLog("life_order_auto_sync", "auto-logid-001", "1", 1780842000000L);
        latest.setRemark("status=SYNCED, total=3, created=1, updated=2, failed=0");
        when(channelSyncLogMapper.selectVoList(any())).thenReturn(List.of(latest));

        YyChannelAutoSyncStatusVo status = service.queryAutoSyncStatus("DOUYIN_LIFE");

        assertEquals("DOUYIN_LIFE", status.getChannelType());
        assertEquals("life_order_auto_sync", status.getApiName());
        assertEquals("SYNCED", status.getSyncStatus());
        assertTrue(Boolean.TRUE.equals(status.getSuccess()));
        assertEquals("auto-logid-001", status.getLastLogId());
        assertEquals("status=SYNCED, total=3, created=1, updated=2, failed=0", status.getSummary());
        assertEquals("自动同步正常", status.getMessage());
    }

    private static YyChannelSyncLogVo syncLog(String apiName, String requestId, String success, long createTime) {
        YyChannelSyncLogVo vo = new YyChannelSyncLogVo();
        vo.setChannelType("DOUYIN_LIFE");
        vo.setApiName(apiName);
        vo.setRequestId(requestId);
        vo.setSuccess(success);
        vo.setCreateTime(new Date(createTime));
        return vo;
    }
}
