package org.dromara.yy.domain.vo;

import java.io.Serial;
import java.io.Serializable;

/**
 * 影约云企业版后续模块落点
 */
public class YyEnterpriseModuleVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private final String code;
    private final String stage;
    private final String module;
    private final String priority;
    private final String status;
    private final String frontendPath;
    private final String dataModel;
    private final String scope;
    private final String dependencies;
    private final String nextAction;

    public YyEnterpriseModuleVo(String code, String stage, String module, String priority, String status,
                                String frontendPath, String dataModel, String scope,
                                String dependencies, String nextAction) {
        this.code = code;
        this.stage = stage;
        this.module = module;
        this.priority = priority;
        this.status = status;
        this.frontendPath = frontendPath;
        this.dataModel = dataModel;
        this.scope = scope;
        this.dependencies = dependencies;
        this.nextAction = nextAction;
    }

    public String getCode() {
        return code;
    }

    public String getStage() {
        return stage;
    }

    public String getModule() {
        return module;
    }

    public String getPriority() {
        return priority;
    }

    public String getStatus() {
        return status;
    }

    public String getFrontendPath() {
        return frontendPath;
    }

    public String getDataModel() {
        return dataModel;
    }

    public String getScope() {
        return scope;
    }

    public String getDependencies() {
        return dependencies;
    }

    public String getNextAction() {
        return nextAction;
    }
}
