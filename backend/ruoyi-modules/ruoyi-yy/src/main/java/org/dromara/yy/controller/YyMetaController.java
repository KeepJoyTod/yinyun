package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.yy.domain.vo.YyEnterpriseModuleVo;
import org.dromara.yy.domain.vo.YyPriorityFeatureVo;
import org.dromara.yy.service.IYyMetaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 影约云模块元数据
 */
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/meta")
public class YyMetaController {

    private final IYyMetaService yyMetaService;

    /**
     * 查询标红优先功能清单
     */
    @SaCheckPermission("yy:dashboard:list")
    @GetMapping("/priority-features")
    public R<List<YyPriorityFeatureVo>> priorityFeatures() {
        return R.ok(yyMetaService.listPriorityFeatures());
    }

    /**
     * 查询企业版下一批模块清单
     */
    @SaCheckPermission("yy:dashboard:list")
    @GetMapping("/enterprise-modules")
    public R<List<YyEnterpriseModuleVo>> enterpriseModules() {
        return R.ok(yyMetaService.listEnterpriseModules());
    }
}
