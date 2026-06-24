package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.excel.utils.ExcelUtil;
import org.dromara.common.idempotent.annotation.RepeatSubmit;
import org.dromara.common.log.annotation.Log;
import org.dromara.common.log.enums.BusinessType;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.web.core.BaseController;
import org.dromara.yy.domain.bo.YyChannelAccountBo;
import org.dromara.yy.domain.vo.YyChannelAccountVo;
import org.dromara.yy.service.IYyChannelAccountService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 渠道授权账号
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/channelAccount")
public class YyChannelAccountController extends BaseController {

    private final IYyChannelAccountService yyChannelAccountService;

    /**
     * 查询渠道授权账号列表
     */
    @SaCheckPermission("yy:channel:list")
    @GetMapping("/list")
    public TableDataInfo<YyChannelAccountVo> list(YyChannelAccountBo bo, PageQuery pageQuery) {
        return yyChannelAccountService.queryPageList(bo, pageQuery);
    }

    /**
     * 导出渠道授权账号列表
     */
    @SaCheckPermission("yy:channel:export")
    @Log(title = "渠道授权账号", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(YyChannelAccountBo bo, HttpServletResponse response) {
        List<YyChannelAccountVo> list = yyChannelAccountService.queryList(bo);
        ExcelUtil.exportExcel(list, "渠道授权账号", YyChannelAccountVo.class, response);
    }

    /**
     * 获取渠道授权账号详细信息
     */
    @SaCheckPermission("yy:channel:query")
    @GetMapping("/{id}")
    public R<YyChannelAccountVo> getInfo(@NotNull(message = "主键不能为空") @PathVariable Long id) {
        return R.ok(yyChannelAccountService.queryById(id));
    }

    /**
     * 新增渠道授权账号
     */
    @SaCheckPermission("yy:channel:add")
    @Log(title = "渠道授权账号", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping()
    public R<Void> add(@Validated(AddGroup.class) @RequestBody YyChannelAccountBo bo) {
        return toAjax(yyChannelAccountService.insertByBo(bo));
    }

    /**
     * 修改渠道授权账号
     */
    @SaCheckPermission("yy:channel:edit")
    @Log(title = "渠道授权账号", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody YyChannelAccountBo bo) {
        return toAjax(yyChannelAccountService.updateByBo(bo));
    }

    /**
     * 删除渠道授权账号
     */
    @SaCheckPermission("yy:channel:remove")
    @Log(title = "渠道授权账号", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空") @PathVariable Long[] ids) {
        return toAjax(yyChannelAccountService.deleteWithValidByIds(List.of(ids), true));
    }
}
