package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyPhotoAssetBo;
import org.dromara.yy.domain.vo.YyPhotoAssetVo;

import java.util.Collection;
import java.util.List;

/**
 * 影约云底片Service接口
 */
public interface IYyPhotoAssetService {

    /**
     * 查询底片列表
     */
    YyPhotoAssetVo queryById(Long id);

    /**
     * 分页查询底片列表
     */
    TableDataInfo<YyPhotoAssetVo> queryPageList(YyPhotoAssetBo bo, PageQuery pageQuery);

    /**
     * 查询底片列表列表
     */
    List<YyPhotoAssetVo> queryList(YyPhotoAssetBo bo);

    /**
     * 新增底片列表
     */
    Boolean insertByBo(YyPhotoAssetBo bo);

    /**
     * 修改底片列表
     */
    Boolean updateByBo(YyPhotoAssetBo bo);

    /**
     * 校验并批量删除底片列表
     */
    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
