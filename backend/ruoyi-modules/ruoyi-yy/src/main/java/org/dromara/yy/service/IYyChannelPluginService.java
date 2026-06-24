package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyChannelPluginBo;
import org.dromara.yy.domain.vo.YyChannelPluginVo;

import java.util.Collection;
import java.util.List;

/**
 * 影约云渠道插件Service接口
 */
public interface IYyChannelPluginService {

    /**
     * 查询渠道插件
     */
    YyChannelPluginVo queryById(Long id);

    /**
     * 分页查询渠道插件
     */
    TableDataInfo<YyChannelPluginVo> queryPageList(YyChannelPluginBo bo, PageQuery pageQuery);

    /**
     * 查询渠道插件列表
     */
    List<YyChannelPluginVo> queryList(YyChannelPluginBo bo);

    /**
     * 新增渠道插件
     */
    Boolean insertByBo(YyChannelPluginBo bo);

    /**
     * 修改渠道插件
     */
    Boolean updateByBo(YyChannelPluginBo bo);

    /**
     * 校验并批量删除渠道插件
     */
    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
