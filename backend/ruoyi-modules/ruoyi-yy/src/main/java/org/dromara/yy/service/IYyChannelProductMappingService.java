package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyChannelProductMappingBo;
import org.dromara.yy.domain.vo.ClientDouyinLifeOrderEntryVo;
import org.dromara.yy.domain.vo.YyChannelProductMappingVo;

import java.util.Collection;
import java.util.List;

/**
 * 影约云渠道商品映射Service接口
 */
public interface IYyChannelProductMappingService {

    /**
     * 查询渠道商品映射
     */
    YyChannelProductMappingVo queryById(Long id);

    /**
     * 分页查询渠道商品映射
     */
    TableDataInfo<YyChannelProductMappingVo> queryPageList(YyChannelProductMappingBo bo, PageQuery pageQuery);

    /**
     * 查询渠道商品映射列表
     */
    List<YyChannelProductMappingVo> queryList(YyChannelProductMappingBo bo);

    /**
     * 查询客户端可展示的抖音来客真实下单入口
     */
    List<ClientDouyinLifeOrderEntryVo> queryPublicDouyinLifeOrderEntries(Long storeId);

    /**
     * 新增渠道商品映射
     */
    Boolean insertByBo(YyChannelProductMappingBo bo);

    /**
     * 修改渠道商品映射
     */
    Boolean updateByBo(YyChannelProductMappingBo bo);

    /**
     * 校验并批量删除渠道商品映射
     */
    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
