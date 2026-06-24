package org.dromara.yy.service.impl;

import org.dromara.yy.domain.YyChannelAccount;
import org.dromara.yy.domain.bo.YyChannelAccountBo;
import org.dromara.yy.domain.vo.YyChannelAccountVo;
import org.dromara.yy.mapper.YyChannelAccountMapper;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyChannelAccountServiceImplTest {

    @Mock
    private YyChannelAccountMapper channelAccountMapper;

    @Test
    void queryByIdShouldMaskSecretFields() {
        YyChannelAccountVo vo = new YyChannelAccountVo();
        vo.setId(1001L);
        vo.setAppSecretEnc("client-secret");
        vo.setAccessTokenEnc("access-token");
        vo.setRefreshTokenEnc("refresh-token");
        when(channelAccountMapper.selectVoById(1001L)).thenReturn(vo);

        YyChannelAccountServiceImpl service = new YyChannelAccountServiceImpl(channelAccountMapper);

        YyChannelAccountVo result = service.queryById(1001L);

        assertEquals("******", result.getAppSecretEnc());
        assertEquals("******", result.getAccessTokenEnc());
        assertEquals("******", result.getRefreshTokenEnc());
    }

    @Test
    void updateByBoShouldPreserveMaskedOrBlankSecretFields() {
        YyChannelAccount existing = new YyChannelAccount();
        existing.setId(1002L);
        existing.setAppSecretEnc("old-client-secret");
        existing.setAccessTokenEnc("old-access-token");
        existing.setRefreshTokenEnc("old-refresh-token");
        when(channelAccountMapper.selectById(1002L)).thenReturn(existing);
        when(channelAccountMapper.updateById(any(YyChannelAccount.class))).thenReturn(1);

        YyChannelAccountBo bo = new YyChannelAccountBo();
        bo.setId(1002L);
        bo.setChannelType("DOUYIN_LIFE");
        bo.setAppSecretEnc("******");
        bo.setAccessTokenEnc("");
        bo.setRefreshTokenEnc("new-refresh-token");

        YyChannelAccountServiceImpl service = new YyChannelAccountServiceImpl(channelAccountMapper);

        service.updateByBo(bo);

        ArgumentCaptor<YyChannelAccount> captor = ArgumentCaptor.forClass(YyChannelAccount.class);
        verify(channelAccountMapper).updateById(captor.capture());
        YyChannelAccount updated = captor.getValue();
        assertEquals("old-client-secret", updated.getAppSecretEnc());
        assertEquals("old-access-token", updated.getAccessTokenEnc());
        assertEquals("new-refresh-token", updated.getRefreshTokenEnc());
    }
}
