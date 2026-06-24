package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyChannelSyncLogBo;
import org.dromara.yy.domain.vo.YyChannelAcceptanceCaseVo;
import org.dromara.yy.domain.vo.YyChannelAutoSyncStatusVo;
import org.dromara.yy.domain.vo.YyChannelSyncLogVo;

import java.util.Collection;
import java.util.List;

/**
 * 影约云渠道同步日志Service接口
 */
public interface IYyChannelSyncLogService {

    /**
     * 查询渠道同步日志
     */
    YyChannelSyncLogVo queryById(Long id);

    /**
     * 分页查询渠道同步日志
     */
    TableDataInfo<YyChannelSyncLogVo> queryPageList(YyChannelSyncLogBo bo, PageQuery pageQuery);

    /**
     * 查询渠道同步日志列表
     */
    List<YyChannelSyncLogVo> queryList(YyChannelSyncLogBo bo);

    /**
     * 查询渠道开放平台验收用例与最近 logid。
     */
    List<YyChannelAcceptanceCaseVo> queryAcceptanceCases(String channelType);

    /**
     * 查询渠道自动同步状态摘要。
     */
    YyChannelAutoSyncStatusVo queryAutoSyncStatus(String channelType);

    /**
     * 新增渠道同步日志
     */
    Boolean insertByBo(YyChannelSyncLogBo bo);

    /**
     * 修改渠道同步日志
     */
    Boolean updateByBo(YyChannelSyncLogBo bo);

    /**
     * 校验并批量删除渠道同步日志
     */
    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
