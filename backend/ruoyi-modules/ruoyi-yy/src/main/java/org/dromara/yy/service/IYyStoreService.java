package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyStoreBo;
import org.dromara.yy.domain.vo.YyStoreVo;

import java.util.Collection;
import java.util.List;

/**
 * 影约云门店Service接口
 */
public interface IYyStoreService {

    /**
     * 查询门店管理
     */
    YyStoreVo queryById(Long id);

    /**
     * 分页查询门店管理
     */
    TableDataInfo<YyStoreVo> queryPageList(YyStoreBo bo, PageQuery pageQuery);

    /**
     * 查询门店管理列表
     */
    List<YyStoreVo> queryList(YyStoreBo bo);

    /**
     * 新增门店管理
     */
    Boolean insertByBo(YyStoreBo bo);

    /**
     * 修改门店管理
     */
    Boolean updateByBo(YyStoreBo bo);

    /**
     * 校验并批量删除门店管理
     */
    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
