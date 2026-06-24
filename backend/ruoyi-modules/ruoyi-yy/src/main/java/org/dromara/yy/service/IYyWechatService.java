package org.dromara.yy.service;

import org.dromara.yy.domain.bo.YyWechatNoticeTestBo;
import org.dromara.yy.domain.vo.YyWechatWorkbenchVo;

/**
 * 微信生态接入服务
 */
public interface IYyWechatService {

    /**
     * 查询微信生态工作台
     */
    YyWechatWorkbenchVo workbench();

    /**
     * 预览通知接口
     */
    String previewNotice(YyWechatNoticeTestBo bo);
}
