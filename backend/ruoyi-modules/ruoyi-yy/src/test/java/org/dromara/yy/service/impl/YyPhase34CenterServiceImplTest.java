package org.dromara.yy.service.impl;

import org.dromara.yy.domain.YyPaymentRecord;
import org.dromara.yy.domain.bo.YyCustomerBo;
import org.dromara.yy.domain.bo.YyFinanceTransactionQueryBo;
import org.dromara.yy.domain.bo.YyNotificationLogBo;
import org.dromara.yy.domain.bo.YyPhotoAlbumBo;
import org.dromara.yy.domain.bo.YyStoreBo;
import org.dromara.yy.domain.vo.YyAccountBrandVo;
import org.dromara.yy.domain.vo.YyCustomerVo;
import org.dromara.yy.domain.vo.YyFinanceOverviewVo;
import org.dromara.yy.domain.vo.YyFinanceTransactionVo;
import org.dromara.yy.domain.vo.YyNotificationLogVo;
import org.dromara.yy.domain.vo.YyPhotoAlbumVo;
import org.dromara.yy.domain.vo.YyStoreVo;
import org.dromara.yy.domain.vo.YyToolPrecisionDeliverySummaryVo;
import org.dromara.yy.domain.vo.YyToolSampleWorkVo;
import org.dromara.yy.mapper.YyPaymentRecordMapper;
import org.dromara.yy.service.IYyCustomerService;
import org.dromara.yy.service.IYyNotificationLogService;
import org.dromara.yy.service.IYyPhotoAlbumService;
import org.dromara.yy.service.IYyStoreService;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyPhase34CenterServiceImplTest {

    @Mock
    private IYyPhotoAlbumService photoAlbumService;

    @Mock
    private IYyCustomerService customerService;

    @Mock
    private IYyNotificationLogService notificationLogService;

    @Mock
    private IYyStoreService storeService;

    @Mock
    private YyPaymentRecordMapper paymentRecordMapper;

    @Test
    void toolCenterShouldDeriveSampleWorksAndDeliveryMetricsFromLedgers() {
        YyPhotoAlbumVo album = new YyPhotoAlbumVo();
        album.setId(9001L);
        album.setAlbumName("授权样片相册");
        album.setStatus("ACTIVE");
        album.setUpdateTime(new Date());
        when(photoAlbumService.queryList(any(YyPhotoAlbumBo.class))).thenReturn(List.of(album));

        YyCustomerVo customer = new YyCustomerVo();
        customer.setId(8001L);
        when(customerService.queryList(any(YyCustomerBo.class))).thenReturn(List.of(customer));

        YyNotificationLogVo sentLog = new YyNotificationLogVo();
        sentLog.setChannelType("WECHAT");
        sentLog.setSendStatus("SENT");
        YyNotificationLogVo draftLog = new YyNotificationLogVo();
        draftLog.setChannelType("SMS");
        draftLog.setSendStatus("PENDING");
        when(notificationLogService.queryList(any(YyNotificationLogBo.class))).thenReturn(List.of(sentLog, draftLog));

        YyToolCenterServiceImpl service = new YyToolCenterServiceImpl(photoAlbumService, customerService, notificationLogService);

        YyToolSampleWorkVo sample = service.listSampleWorks().get(0);
        YyToolPrecisionDeliverySummaryVo summary = service.getPrecisionDeliverySummary();

        assertEquals("album-9001", sample.getSampleId());
        assertEquals("PUBLISHED", sample.getPublishStatus());
        assertEquals(1, summary.getAudienceCount());
        assertEquals(1, summary.getDeliveredCount());
        assertEquals(1, summary.getActiveTaskCount());
    }

    @Test
    void accountCenterShouldDeriveBrandsFromStoreScope() {
        YyStoreVo store = new YyStoreVo();
        store.setId(1001L);
        store.setStoreName("深圳旗舰店");
        store.setStatus("ACTIVE");
        when(storeService.queryList(any(YyStoreBo.class))).thenReturn(List.of(store));

        YyAccountCenterServiceImpl service = new YyAccountCenterServiceImpl(storeService);

        YyAccountBrandVo brand = service.listBrands().get(0);

        assertEquals("1001", brand.getBrandId());
        assertEquals("深圳旗舰店", brand.getBrandName());
        assertEquals("ready", brand.getStatus());
    }

    @Test
    void financeCenterShouldAggregatePaymentLedgerWithoutWritingFunds() {
        YyPaymentRecord record = new YyPaymentRecord();
        record.setId(3001L);
        record.setProvider("WECHAT");
        record.setPayStatus("PAID");
        record.setAmountCent(1200L);
        record.setPaidAmountCent(1200L);
        record.setRefundAmountCent(200L);
        record.setPaidTime(new Date(1_700_000_000_000L));
        when(paymentRecordMapper.selectList(null)).thenReturn(List.of(record));

        YyFinanceCenterServiceImpl service = new YyFinanceCenterServiceImpl(paymentRecordMapper);

        YyFinanceOverviewVo overview = service.getOverview();
        YyFinanceTransactionVo transaction = service.listTransactions(new YyFinanceTransactionQueryBo()).get(0);

        assertEquals(1000L, overview.getAvailableBalanceCent());
        assertEquals(1200L, overview.getPrepaidBalanceCent());
        assertEquals("WECHAT", transaction.getTransactionItem());
        assertEquals(1000L, transaction.getAmountCent());
    }
}
