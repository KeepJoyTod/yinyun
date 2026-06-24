package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyChannelOrderMappingBo;
import org.dromara.yy.domain.vo.YyChannelOrderMappingVo;

import java.util.Collection;
import java.util.List;

/**
 * 影约云渠道订单映射Service接口
 */
public interface IYyChannelOrderMappingService {

    /**
     * 查询渠道订单映射
     */
    YyChannelOrderMappingVo queryById(Long id);

    /**
     * 分页查询渠道订单映射
     */
    TableDataInfo<YyChannelOrderMappingVo> queryPageList(YyChannelOrderMappingBo bo, PageQuery pageQuery);

    /**
     * 查询渠道订单映射列表
     */
    List<YyChannelOrderMappingVo> queryList(YyChannelOrderMappingBo bo);

    /**
     * 新增渠道订单映射
     */
    Boolean insertByBo(YyChannelOrderMappingBo bo);

    /**
     * 修改渠道订单映射
     */
    Boolean updateByBo(YyChannelOrderMappingBo bo);

    /**
     * 校验并批量删除渠道订单映射
     */
    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
