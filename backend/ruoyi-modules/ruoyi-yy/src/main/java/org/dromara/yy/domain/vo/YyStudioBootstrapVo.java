package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * 门店工作台启动上下文。
 */
@Data
public class YyStudioBootstrapVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Identity identity;
    private Boolean globalStoreScope;
    private List<StoreScope> stores;
    private Set<String> menuPermissions;
    private Set<String> rolePermissions;
    private Map<String, String> featureStatuses;
    private Pending pending;

    @Data
    public static class Identity implements Serializable {

        @Serial
        private static final long serialVersionUID = 1L;

        private String userId;
        private String username;
        private String nickname;
        private String employeeId;
        private String employeeNo;
        private String employeeName;
        private String roleType;
        private String storeId;
    }

    @Data
    public static class StoreScope implements Serializable {

        @Serial
        private static final long serialVersionUID = 1L;

        private String storeId;
        private String storeCode;
        private String storeName;
        private String status;
        private String roleType;
        private Boolean primary;
    }

    @Data
    public static class Pending implements Serializable {

        @Serial
        private static final long serialVersionUID = 1L;

        private Long pendingOrders;
        private Long todayArrivals;
        private Long inventoryConflicts;
        private Long activeSelections;
    }
}
