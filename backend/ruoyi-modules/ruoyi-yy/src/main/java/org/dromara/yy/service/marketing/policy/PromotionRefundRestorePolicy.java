package org.dromara.yy.service.marketing.policy;

public class PromotionRefundRestorePolicy {

    public String resolveRestorePolicy() {
        return "仅恢复已核销且允许退单恢复的券/权益；已过期或失效实例不恢复。";
    }
}
