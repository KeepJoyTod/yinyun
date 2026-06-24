package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.incrementer.IdentifierGenerator;
import org.dromara.yy.domain.YyCustomer;
import org.dromara.yy.mapper.YyCustomerMapper;
import org.dromara.yy.mapper.YyOrderMapper;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyCustomerServiceImplTest {

    @Mock
    private YyCustomerMapper customerMapper;

    @Mock
    private IdentifierGenerator identifierGenerator;

    @Mock
    private YyOrderMapper orderMapper;

    @Test
    void upsertByMobileShouldInsertCustomerWhenAbsent() {
        when(customerMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        when(customerMapper.insert(any(YyCustomer.class))).thenReturn(1);
        AtomicLong idSequence = new AtomicLong(900000000000000000L);
        when(identifierGenerator.nextId((Serializable) null)).thenAnswer(invocation -> idSequence.incrementAndGet());
        YyCustomerServiceImpl service = new YyCustomerServiceImpl(customerMapper, identifierGenerator, orderMapper);
        Date orderTime = new Date(1780243200000L);

        Long customerId = service.upsertByMobile("查询客户", "13800000000", "DOUYIN_LIFE", new BigDecimal("100.50"), orderTime, "抖音来客查单同步");

        assertNotNull(customerId);
        ArgumentCaptor<YyCustomer> captor = ArgumentCaptor.forClass(YyCustomer.class);
        verify(customerMapper).insert(captor.capture());
        YyCustomer customer = captor.getValue();
        assertEquals(customerId, customer.getId());
        assertEquals("查询客户", customer.getCustomerName());
        assertEquals("13800000000", customer.getMobile());
        assertEquals("DOUYIN_LIFE", customer.getSource());
        assertEquals("NORMAL", customer.getMemberLevel());
        assertEquals(1, customer.getTotalOrderCount());
        assertEquals(new BigDecimal("100.50"), customer.getTotalSpend());
        assertEquals(orderTime, customer.getLastOrderTime());
    }

    @Test
    void upsertByMobileShouldUpdateExistingCustomerTotals() {
        YyCustomer existing = new YyCustomer();
        existing.setId(900000000000000001L);
        existing.setCustomerName("老客户");
        existing.setMobile("13800000000");
        existing.setSource("LOCAL");
        existing.setMemberLevel("NORMAL");
        existing.setTotalOrderCount(3);
        existing.setTotalSpend(new BigDecimal("200.00"));
        when(customerMapper.selectOne(any(Wrapper.class))).thenReturn(existing);
        when(customerMapper.updateById(any(YyCustomer.class))).thenReturn(1);
        YyCustomerServiceImpl service = new YyCustomerServiceImpl(customerMapper, identifierGenerator, orderMapper);
        Date orderTime = new Date(1780243200000L);

        Long customerId = service.upsertByMobile("新姓名", "13800000000", "DOUYIN_LIFE", new BigDecimal("50.00"), orderTime, "再次同步");

        assertEquals(existing.getId(), customerId);
        ArgumentCaptor<YyCustomer> captor = ArgumentCaptor.forClass(YyCustomer.class);
        verify(customerMapper).updateById(captor.capture());
        YyCustomer customer = captor.getValue();
        assertEquals("新姓名", customer.getCustomerName());
        assertEquals("DOUYIN_LIFE", customer.getSource());
        assertEquals(4, customer.getTotalOrderCount());
        assertEquals(new BigDecimal("250.00"), customer.getTotalSpend());
        assertEquals(orderTime, customer.getLastOrderTime());
    }

    @Tag("dev")
    @Test
    void queryRecentOrdersByCustomerIdShouldUseCustomerMobile() {
        YyCustomer customer = new YyCustomer();
        customer.setId(1001L);
        customer.setMobile("13800000000");
        when(customerMapper.selectById(1001L)).thenReturn(customer);
        when(orderMapper.selectVoList(any())).thenReturn(List.of());

        YyCustomerServiceImpl service = new YyCustomerServiceImpl(customerMapper, identifierGenerator, orderMapper);

        assertTrue(service.queryRecentOrdersByCustomerId(1001L, 5).isEmpty());
        verify(orderMapper).selectVoList(any());
    }
}
