package org.dromara.yy.service.impl;

import org.dromara.yy.domain.vo.YyMerchantConsumerOpsP1OverviewVo;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Tag("dev")
class YyMerchantConsumerOpsP1ServiceImplTest {

    private final YyMerchantConsumerOpsP1ServiceImpl service = new YyMerchantConsumerOpsP1ServiceImpl();

    @Test
    void overviewShouldExposeReadOnlyP1OwnerScope() {
        YyMerchantConsumerOpsP1OverviewVo overview = service.overview();

        assertEquals("SCAFFOLD", overview.getStatus());
        assertEquals(6, overview.getItems().size());
        assertTrue(overview.getDataLedgers().contains("yy_order"));
        assertEquals("merchant-config", overview.getItems().get(3).getItemKey());
        assertEquals("BUILDING", overview.getItems().get(3).getStatus());
        assertEquals("HIGH", overview.getItems().get(4).getRisk());
        assertFalse(overview.getItems().get(4).getEvidenceRefs().isEmpty());
        assertEquals(3, overview.getDeliveryStandard().size());
    }
}
