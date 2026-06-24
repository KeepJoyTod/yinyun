package org.dromara.yy.domain.vo;

import java.io.Serial;
import java.io.Serializable;

/**
 * 影约云标红功能迁移项
 */
public class YyPriorityFeatureVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private final String code;
    private final String module;
    private final String feature;
    private final String priority;
    private final String status;
    private final String backendTarget;
    private final String frontendTarget;
    private final String note;

    public YyPriorityFeatureVo(String code, String module, String feature, String priority, String status,
                               String backendTarget, String frontendTarget, String note) {
        this.code = code;
        this.module = module;
        this.feature = feature;
        this.priority = priority;
        this.status = status;
        this.backendTarget = backendTarget;
        this.frontendTarget = frontendTarget;
        this.note = note;
    }

    public String getCode() {
        return code;
    }

    public String getModule() {
        return module;
    }

    public String getFeature() {
        return feature;
    }

    public String getPriority() {
        return priority;
    }

    public String getStatus() {
        return status;
    }

    public String getBackendTarget() {
        return backendTarget;
    }

    public String getFrontendTarget() {
        return frontendTarget;
    }

    public String getNote() {
        return note;
    }
}
