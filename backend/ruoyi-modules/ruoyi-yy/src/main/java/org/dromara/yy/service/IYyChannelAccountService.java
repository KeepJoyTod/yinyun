package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyChannelAccountBo;
import org.dromara.yy.domain.vo.YyChannelAccountVo;

import java.util.Collection;
import java.util.List;

/**
 * 影约云渠道授权账号Service接口
 */
public interface IYyChannelAccountService {

    /**
     * 查询渠道授权账号
     */
    YyChannelAccountVo queryById(Long id);

    /**
     * 分页查询渠道授权账号
     */
    TableDataInfo<YyChannelAccountVo> queryPageList(YyChannelAccountBo bo, PageQuery pageQuery);

    /**
     * 查询渠道授权账号列表
     */
    List<YyChannelAccountVo> queryList(YyChannelAccountBo bo);

    /**
     * 新增渠道授权账号
     */
    Boolean insertByBo(YyChannelAccountBo bo);

    /**
     * 修改渠道授权账号
     */
    Boolean updateByBo(YyChannelAccountBo bo);

    /**
     * 校验并批量删除渠道授权账号
     */
    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
