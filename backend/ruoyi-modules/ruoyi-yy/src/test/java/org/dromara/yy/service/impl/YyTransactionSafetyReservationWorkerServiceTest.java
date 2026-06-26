package org.dromara.yy.service.impl;

import org.dromara.yy.domain.bo.YyTransactionSafetyActionBo;
import org.dromara.yy.domain.vo.YyEntitlementReservationVo;
import org.dromara.yy.service.IYyTransactionSafetyService;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyTransactionSafetyReservationWorkerServiceTest {

    @Mock
    private IYyTransactionSafetyService transactionSafetyService;

    @Mock
    private Environment environment;

    @InjectMocks
    private YyTransactionSafetyReservationWorkerService service;

    @Test
    void runOnceShouldReleaseExpiredReservationsWhenEnabled() {
        when(environment.getProperty("yy.transaction-safety.reservation-worker.enabled", "true")).thenReturn("true");
        when(environment.getProperty("yy.transaction-safety.reservation-worker.batch-size", "50")).thenReturn("12");
        when(transactionSafetyService.releaseExpiredEntitlementReservations(org.mockito.ArgumentMatchers.any())).thenReturn(List.of(new YyEntitlementReservationVo(), new YyEntitlementReservationVo()));

        int released = service.runOnce();

        assertEquals(2, released);
        ArgumentCaptor<YyTransactionSafetyActionBo> captor = ArgumentCaptor.forClass(YyTransactionSafetyActionBo.class);
        verify(transactionSafetyService).releaseExpiredEntitlementReservations(captor.capture());
        assertEquals(12, captor.getValue().getLimit());
        assertEquals("reservation-worker", captor.getValue().getLocalAdapterRef());
    }
}
