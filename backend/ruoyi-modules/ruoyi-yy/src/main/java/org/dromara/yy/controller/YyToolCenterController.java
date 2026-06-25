package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.yy.domain.vo.YyToolPrecisionDeliverySummaryVo;
import org.dromara.yy.domain.vo.YyToolPrecisionDeliveryTaskVo;
import org.dromara.yy.domain.vo.YyToolSampleWorkVo;
import org.dromara.yy.service.IYyToolCenterService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/tool-center")
public class YyToolCenterController {

    private final IYyToolCenterService yyToolCenterService;

    @SaCheckPermission("yy:photoAlbum:list")
    @GetMapping("/sample-works")
    public R<List<YyToolSampleWorkVo>> sampleWorks() {
        return R.ok(yyToolCenterService.listSampleWorks());
    }

    @SaCheckPermission("yy:photoAlbum:edit")
    @PostMapping("/sample-works/{sampleId}/publish")
    public R<List<YyToolSampleWorkVo>> publishSampleWork(@PathVariable String sampleId) {
        return R.ok(yyToolCenterService.publishSampleWork(sampleId));
    }

    @SaCheckPermission("yy:notification:list")
    @GetMapping("/precision-delivery/summary")
    public R<YyToolPrecisionDeliverySummaryVo> precisionDeliverySummary() {
        return R.ok(yyToolCenterService.getPrecisionDeliverySummary());
    }

    @SaCheckPermission("yy:notification:list")
    @GetMapping("/precision-delivery/tasks")
    public R<List<YyToolPrecisionDeliveryTaskVo>> precisionDeliveryTasks() {
        return R.ok(yyToolCenterService.listPrecisionDeliveryTasks());
    }
}
