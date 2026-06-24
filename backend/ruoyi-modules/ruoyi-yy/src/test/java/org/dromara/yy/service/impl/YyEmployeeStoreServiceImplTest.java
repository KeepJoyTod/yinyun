package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.dromara.yy.domain.YyEmployeeStore;
import org.dromara.yy.domain.bo.YyEmployeeStoreBo;
import org.dromara.yy.domain.vo.YyEmployeeStoreVo;
import org.dromara.yy.mapper.YyEmployeeStoreMapper;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyEmployeeStoreServiceImplTest {

    @Mock
    private YyEmployeeStoreMapper baseMapper;

    @Test
    void testInsertWithDuplicateShouldNotThrow() {
        AtomicLong idSeq = new AtomicLong(1L);
        when(baseMapper.insert(any(YyEmployeeStore.class))).thenAnswer(invocation -> {
            YyEmployeeStore entity = invocation.getArgument(0);
            entity.setId(idSeq.getAndIncrement());
            return 1;
        });

        YyEmployeeStoreServiceImpl service = new YyEmployeeStoreServiceImpl(baseMapper);

        YyEmployeeStoreBo bo = new YyEmployeeStoreBo();
        bo.setEmployeeId(100L);
        bo.setStoreId(200L);
        bo.setIsPrimary("0");
        bo.setRoleType("STAFF");

        Boolean result = service.insertByBo(bo);

        assertEquals(true, result);
        assertNotNull(bo.getId());
        ArgumentCaptor<YyEmployeeStore> captor = ArgumentCaptor.forClass(YyEmployeeStore.class);
        verify(baseMapper).insert(captor.capture());
        YyEmployeeStore stored = captor.getValue();
        assertEquals(100L, stored.getEmployeeId());
        assertEquals(200L, stored.getStoreId());
    }

    @Test
    void testTwoPrimariesForSameEmployeeShouldFail() {
        when(baseMapper.insert(any(YyEmployeeStore.class))).thenReturn(1);

        YyEmployeeStoreServiceImpl service = new YyEmployeeStoreServiceImpl(baseMapper);

        YyEmployeeStoreBo bo1 = new YyEmployeeStoreBo();
        bo1.setEmployeeId(100L);
        bo1.setStoreId(200L);
        bo1.setIsPrimary("1");
        bo1.setRoleType("STAFF");

        Boolean result1 = service.insertByBo(bo1);
        assertEquals(true, result1);

        YyEmployeeStoreBo bo2 = new YyEmployeeStoreBo();
        bo2.setEmployeeId(100L);
        bo2.setStoreId(300L);
        bo2.setIsPrimary("1");
        bo2.setRoleType("STAFF");

        when(baseMapper.insert(any(YyEmployeeStore.class))).thenThrow(
            new org.dromara.common.core.exception.ServiceException("插入失败：Duplicate entry")
        );

        assertThrows(Exception.class, () -> service.insertByBo(bo2));
    }

    @Test
    void testListStoreScopesReturnsOrdered() {
        YyEmployeeStore s1 = new YyEmployeeStore();
        s1.setId(1L);
        s1.setEmployeeId(100L);
        s1.setStoreId(200L);
        s1.setIsPrimary("1");
        s1.setSort(10);
        s1.setDelFlag("0");

        YyEmployeeStore s2 = new YyEmployeeStore();
        s2.setId(2L);
        s2.setEmployeeId(100L);
        s2.setStoreId(300L);
        s2.setIsPrimary("0");
        s2.setSort(20);
        s2.setDelFlag("0");

        YyEmployeeStore s3 = new YyEmployeeStore();
        s3.setId(3L);
        s3.setEmployeeId(100L);
        s3.setStoreId(400L);
        s3.setIsPrimary("0");
        s3.setSort(5);
        s3.setDelFlag("0");

        List<YyEmployeeStore> entities = List.of(s3, s1, s2);
        List<YyEmployeeStoreVo> vos = List.of(
            createVo(s3), createVo(s1), createVo(s2)
        );

        YyEmployeeStoreServiceImpl service = new YyEmployeeStoreServiceImpl(baseMapper);
        when(baseMapper.selectVoList(any(LambdaQueryWrapper.class))).thenReturn(vos);

        List<YyEmployeeStoreVo> result = service.listStoreScopes(100L);

        assertEquals(3, result.size());
        assertEquals(5, result.get(0).getSort());
        verify(baseMapper).selectVoList(any(LambdaQueryWrapper.class));
    }

    @Test
    void testMigrateFromYyEmployeeStoreId() {
        when(baseMapper.insert(any(YyEmployeeStore.class))).thenAnswer(invocation -> {
            YyEmployeeStore entity = invocation.getArgument(0);
            entity.setId(1L);
            return 1;
        });

        YyEmployeeStoreServiceImpl service = new YyEmployeeStoreServiceImpl(baseMapper);

        YyEmployeeStoreBo bo = new YyEmployeeStoreBo();
        bo.setEmployeeId(1L);
        bo.setStoreId(1L);
        bo.setIsPrimary("1");
        bo.setRoleType("STAFF");
        bo.setStatus("0");
        bo.setSort(0);

        Boolean result = service.insertByBo(bo);

        assertEquals(true, result);
        assertNotNull(bo.getId());
        ArgumentCaptor<YyEmployeeStore> captor = ArgumentCaptor.forClass(YyEmployeeStore.class);
        verify(baseMapper).insert(captor.capture());
        YyEmployeeStore stored = captor.getValue();
        assertEquals(1L, stored.getEmployeeId());
        assertEquals(1L, stored.getStoreId());
        assertEquals("1", stored.getIsPrimary());
        assertEquals("STAFF", stored.getRoleType());
        assertEquals("0", stored.getStatus());
        assertEquals(0, stored.getSort());
    }

    private YyEmployeeStoreVo createVo(YyEmployeeStore entity) {
        YyEmployeeStoreVo vo = new YyEmployeeStoreVo();
        vo.setId(entity.getId());
        vo.setEmployeeId(entity.getEmployeeId());
        vo.setStoreId(entity.getStoreId());
        vo.setIsPrimary(entity.getIsPrimary());
        vo.setRoleType(entity.getRoleType());
        vo.setStatus(entity.getStatus());
        vo.setSort(entity.getSort());
        return vo;
    }
}
