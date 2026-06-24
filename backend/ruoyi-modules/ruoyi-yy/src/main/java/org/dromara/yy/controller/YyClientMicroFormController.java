package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.idempotent.annotation.RepeatSubmit;
import org.dromara.common.ratelimiter.annotation.RateLimiter;
import org.dromara.common.ratelimiter.enums.LimitType;
import org.dromara.yy.domain.bo.ClientMicroFormSubmitRequest;
import org.dromara.yy.domain.vo.ClientMicroFormSubmitVo;
import org.dromara.yy.domain.vo.ClientMicroFormVo;
import org.dromara.yy.service.IYyMicroFormService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.TimeUnit;

@SaIgnore
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/client/microForm")
public class YyClientMicroFormController {

    private final IYyMicroFormService yyMicroFormService;

    @GetMapping("/{id}")
    @RateLimiter(time = 60, count = 120, limitType = LimitType.IP)
    public R<ClientMicroFormVo> getInfo(@PathVariable String id) {
        return R.ok(yyMicroFormService.publicForm(id));
    }

    @PostMapping("/{id}/submit")
    @RateLimiter(time = 60, count = 20, limitType = LimitType.IP)
    @RepeatSubmit(interval = 5, timeUnit = TimeUnit.SECONDS, message = "Form already submitted")
    public R<ClientMicroFormSubmitVo> submit(
        @PathVariable String id,
        @Valid @RequestBody ClientMicroFormSubmitRequest request
    ) {
        return R.ok(yyMicroFormService.submitPublicForm(id, request));
    }
}
