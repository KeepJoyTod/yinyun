package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.idempotent.annotation.RepeatSubmit;
import org.dromara.common.log.annotation.Log;
import org.dromara.common.log.enums.BusinessType;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.web.core.BaseController;
import org.dromara.yy.domain.bo.YyRiskApprovalDecisionBo;
import org.dromara.yy.domain.bo.YyRiskApprovalQueryBo;
import org.dromara.yy.domain.vo.YyRiskApprovalVo;
import org.dromara.yy.service.IYyRiskApprovalService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/riskApproval")
public class YyRiskApprovalController extends BaseController {

    private final IYyRiskApprovalService riskApprovalService;

    @SaCheckPermission("yy:store:list")
    @GetMapping("/list")
    public TableDataInfo<YyRiskApprovalVo> list(YyRiskApprovalQueryBo bo, PageQuery pageQuery) {
        return riskApprovalService.queryPageList(bo, pageQuery);
    }

    @SaCheckPermission("yy:store:edit")
    @Log(title = "风险审批通过", businessType = BusinessType.UPDATE)
    @RepeatSubmit
    @PostMapping("/{id}/approve")
    public R<YyRiskApprovalVo> approve(@PathVariable Long id, @RequestBody(required = false) YyRiskApprovalDecisionBo bo) {
        return R.ok(riskApprovalService.approve(id, bo));
    }

    @SaCheckPermission("yy:store:edit")
    @Log(title = "风险审批驳回", businessType = BusinessType.UPDATE)
    @RepeatSubmit
    @PostMapping("/{id}/reject")
    public R<YyRiskApprovalVo> reject(@PathVariable Long id, @RequestBody(required = false) YyRiskApprovalDecisionBo bo) {
        return R.ok(riskApprovalService.reject(id, bo));
    }
}
