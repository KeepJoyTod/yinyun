package org.dromara.yy.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 影约云业务定时任务开关。
 */
@Configuration
@EnableScheduling
@ConditionalOnProperty(prefix = "yy.scheduling", name = "enabled", havingValue = "true", matchIfMissing = true)
public class YySchedulingConfig {
}
