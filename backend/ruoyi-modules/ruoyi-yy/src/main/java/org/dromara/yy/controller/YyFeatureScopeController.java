package org.dromara.yy.controller;

import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.vo.YyFeatureScopeVo;
import org.dromara.yy.service.IYyFeatureScopeService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/featureScope")
public class YyFeatureScopeController {

    private final IYyFeatureScopeService yyFeatureScopeService;

    @GetMapping("/list")
    public R<List<YyFeatureScopeVo>> list(@RequestParam(required = false) String featureKeys) {
        return R.ok(yyFeatureScopeService.listFeatureScopes(splitFeatureKeys(featureKeys)));
    }

    private List<String> splitFeatureKeys(String featureKeys) {
        if (StringUtils.isBlank(featureKeys)) {
            return List.of();
        }
        List<String> results = new ArrayList<>();
        for (String item : StringUtils.split(featureKeys, ',')) {
            String normalized = StringUtils.trimToEmpty(item);
            if (StringUtils.isBlank(normalized) || results.contains(normalized)) {
                continue;
            }
            results.add(normalized);
        }
        return results;
    }
}
