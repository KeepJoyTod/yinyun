package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyProductBo;
import org.dromara.yy.domain.vo.YyProductVo;

import java.util.Collection;
import java.util.List;

/**
 * 影约云产品Service接口
 */
public interface IYyProductService {

    /**
     * 查询产品管理
     */
    YyProductVo queryById(Long id);

    /**
     * 分页查询产品管理
     */
    TableDataInfo<YyProductVo> queryPageList(YyProductBo bo, PageQuery pageQuery);

    /**
     * 查询产品管理列表
     */
    List<YyProductVo> queryList(YyProductBo bo);

    /**
     * 新增产品管理
     */
    Boolean insertByBo(YyProductBo bo);

    /**
     * 修改产品管理
     */
    Boolean updateByBo(YyProductBo bo);

    /**
     * 校验并批量删除产品管理
     */
    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
