package org.dromara.yy.config;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import org.springframework.scheduling.annotation.EnableScheduling;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@Tag("dev")
class YySchedulingConfigTest {

    @Test
    void shouldEnableSpringSchedulingIndependentOfSnailJob() {
        assertNotNull(YySchedulingConfig.class.getAnnotation(EnableScheduling.class));
    }
}
