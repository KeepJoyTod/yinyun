package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.dromara.common.excel.utils.ExcelUtil;
import org.dromara.common.log.annotation.Log;
import org.dromara.common.log.enums.BusinessType;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.web.core.BaseController;
import org.dromara.yy.domain.bo.YyPhotoAccessLogBo;
import org.dromara.yy.domain.vo.YyPhotoAccessLogVo;
import org.dromara.yy.service.IYyPhotoAccessLogService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 客户取片访问日志
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/photoAccessLog")
public class YyPhotoAccessLogController extends BaseController {

    private final IYyPhotoAccessLogService yyPhotoAccessLogService;

    /**
     * 查询客户取片访问日志列表
     */
    @SaCheckPermission("yy:photoAccessLog:list")
    @GetMapping("/list")
    public TableDataInfo<YyPhotoAccessLogVo> list(YyPhotoAccessLogBo bo, PageQuery pageQuery) {
        return yyPhotoAccessLogService.queryPageList(bo, pageQuery);
    }

    /**
     * 导出客户取片访问日志列表
     */
    @SaCheckPermission("yy:photoAccessLog:export")
    @Log(title = "客户取片访问日志", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(YyPhotoAccessLogBo bo, HttpServletResponse response) {
        List<YyPhotoAccessLogVo> list = yyPhotoAccessLogService.queryList(bo);
        ExcelUtil.exportExcel(list, "客户取片访问日志", YyPhotoAccessLogVo.class, response);
    }
}
