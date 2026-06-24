package org.dromara.yy.channel.douyin;

import org.dromara.yy.domain.bo.YyChannelOrderQuery;
import org.dromara.yy.domain.vo.YyChannelApiResultVo;
import org.dromara.yy.mapper.YyChannelAccountMapper;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DouyinChannelAdapterTest {

    @Mock
    private YyChannelAccountMapper channelAccountMapper;

    @Mock
    private Environment environment;

    @Tag("dev")
    @Test
    void clientTokenMissingConfigShouldUseConfiguredSandboxEndpoint() {
        when(environment.getProperty("yy.douyin.base-url")).thenReturn("https://open-sandbox.douyin.com");

        DouyinChannelAdapter adapter = new DouyinChannelAdapter(channelAccountMapper, environment);
        YyChannelApiResultVo result = adapter.clientToken(new YyChannelOrderQuery());

        assertFalse(result.getSuccess());
        assertEquals("https://open-sandbox.douyin.com/oauth/client_token/", result.getEndpoint());
        assertTrue(result.getMissingConfig().contains("client_key"));
        assertTrue(result.getMissingConfig().contains("client_secret"));
    }

    @Tag("dev")
    @Test
    void purchaseListMissingConfigShouldUseConfiguredSandboxEndpoint() {
        when(environment.getProperty("yy.douyin.base-url")).thenReturn("https://open-sandbox.douyin.com");

        DouyinChannelAdapter adapter = new DouyinChannelAdapter(channelAccountMapper, environment);
        YyChannelApiResultVo result = adapter.purchaseList(new YyChannelOrderQuery());

        assertFalse(result.getSuccess());
        assertEquals("https://open-sandbox.douyin.com/market/service/user/purchase/list/", result.getEndpoint());
        assertTrue(result.getMissingConfig().contains("open_id"));
        assertTrue(result.getMissingConfig().contains("service_id"));
        assertTrue(result.getMissingConfig().contains("service_mode_id"));
    }
}
