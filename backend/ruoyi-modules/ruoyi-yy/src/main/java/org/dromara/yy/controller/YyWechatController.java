package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.yy.domain.bo.YyWechatNoticeTestBo;
import org.dromara.yy.domain.vo.YyWechatWorkbenchVo;
import org.dromara.yy.service.IYyWechatService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 影约云微信生态接入入口
 */
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/wechat")
public class YyWechatController {

    private final IYyWechatService yyWechatService;

    /**
     * 查询微信生态工作台
     */
    @SaCheckPermission("yy:wechat:list")
    @GetMapping("/workbench")
    public R<YyWechatWorkbenchVo> workbench() {
        return R.ok(yyWechatService.workbench());
    }

    /**
     * 预览通知发送接口
     */
    @SaCheckPermission("yy:wechat:send")
    @PostMapping("/notice/test")
    public R<String> noticeTest(@RequestBody YyWechatNoticeTestBo bo) {
        return R.ok("操作成功", yyWechatService.previewNotice(bo));
    }
}
