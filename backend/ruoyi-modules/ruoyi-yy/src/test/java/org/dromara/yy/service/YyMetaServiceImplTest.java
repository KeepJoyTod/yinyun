package org.dromara.yy.service;

import org.dromara.yy.service.impl.YyMetaServiceImpl;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class YyMetaServiceImplTest {

    @Tag("dev")
    @Test
    void shouldExposeRedPriorityFeaturesIncludingDouyinLife() {
        YyMetaServiceImpl service = new YyMetaServiceImpl();
        List<String> codes = service.listPriorityFeatures().stream()
            .map(feature -> feature.getCode())
            .toList();

        assertEquals(List.of("B-029", "B-002", "B-008", "B-022", "C-020", "B-026", "B-026-LIFE", "B-027"), codes);
    }

    @Tag("dev")
    @Test
    void shouldExposeEnterpriseSecondBatchModules() {
        YyMetaServiceImpl service = new YyMetaServiceImpl();
        List<String> codes = service.listEnterpriseModules().stream()
            .map(module -> module.getCode())
            .toList();

        assertEquals(
            List.of("P1-BOOKING-CONFIG", "P1-EMPLOYEE", "P1-CUSTOMER", "P1-NOTIFICATION", "P1-MOBILE", "P2-REPORT"),
            codes
        );
    }
}
