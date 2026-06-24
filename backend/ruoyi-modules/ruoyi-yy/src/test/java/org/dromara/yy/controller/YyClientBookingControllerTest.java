package org.dromara.yy.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.dromara.common.idempotent.annotation.RepeatSubmit;
import org.dromara.common.ratelimiter.annotation.RateLimiter;
import org.dromara.common.ratelimiter.enums.LimitType;
import org.dromara.yy.domain.bo.ClientBookingIntentRequest;
import org.dromara.yy.domain.vo.ClientBookingIntentVo;
import org.dromara.yy.service.IYyOrderService;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Method;
import java.util.Date;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyClientBookingControllerTest {

    @Mock
    private IYyOrderService orderService;

    @Test
    void submitIntentShouldDelegateToOrderService() {
        YyClientBookingController controller = new YyClientBookingController(orderService);
        ClientBookingIntentRequest request = new ClientBookingIntentRequest();
        request.setName("陈女士");
        request.setPhone("13800000000");
        request.setService("证件照精修套餐");
        request.setArrivalTime(new Date(1781234400000L));
        ClientBookingIntentVo result = new ClientBookingIntentVo();
        result.setOrderNo("YYWEB-20260610-000001");
        result.setStatus("PENDING");
        when(orderService.createClientBookingIntent(eq(request), eq("127.0.0.1"))).thenReturn(result);

        assertEquals(result, controller.create(request, "127.0.0.1").getData());

        verify(orderService).createClientBookingIntent(eq(request), eq("127.0.0.1"));
    }

    @Test
    void publicCreateEndpointShouldHaveAntiAbuseGuards() throws NoSuchMethodException {
        Method method = YyClientBookingController.class.getDeclaredMethod(
            "create",
            ClientBookingIntentRequest.class,
            HttpServletRequest.class
        );

        RateLimiter rateLimiter = method.getAnnotation(RateLimiter.class);
        RepeatSubmit repeatSubmit = method.getAnnotation(RepeatSubmit.class);

        assertNotNull(rateLimiter);
        assertEquals(LimitType.IP, rateLimiter.limitType());
        assertEquals(60, rateLimiter.time());
        assertTrue(rateLimiter.count() <= 10);
        assertNotNull(repeatSubmit);
        assertTrue(repeatSubmit.timeUnit().toMillis(repeatSubmit.interval()) >= TimeUnit.SECONDS.toMillis(5));
    }
}
