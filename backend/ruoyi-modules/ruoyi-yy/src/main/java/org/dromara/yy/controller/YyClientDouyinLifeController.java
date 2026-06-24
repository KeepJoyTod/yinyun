package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.yy.domain.vo.ClientDouyinLifeOrderEntryVo;
import org.dromara.yy.service.IYyChannelProductMappingService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 抖音小程序/H5 客户真实下单入口。
 */
@SaIgnore
@RequiredArgsConstructor
@RestController
@RequestMapping("/client/douyin-life")
public class YyClientDouyinLifeController {

    private final IYyChannelProductMappingService channelProductMappingService;

    @GetMapping("/order-entries")
    public R<List<ClientDouyinLifeOrderEntryVo>> orderEntries(@RequestParam(required = false) Long storeId) {
        return R.ok(channelProductMappingService.queryPublicDouyinLifeOrderEntries(storeId));
    }
}
