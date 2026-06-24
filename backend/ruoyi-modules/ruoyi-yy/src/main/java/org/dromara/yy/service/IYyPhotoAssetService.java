package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyPhotoAssetBatchUpdateBo;
import org.dromara.yy.domain.bo.YyPhotoAssetBo;
import org.dromara.yy.domain.vo.YyPhotoAssetVo;
import org.dromara.yy.domain.vo.YyPhotoResourceRowVo;

import java.util.Collection;
import java.util.List;

/**
 * 褰辩害浜戝簳鐗嘢ervice鎺ュ彛
 */
public interface IYyPhotoAssetService {

    YyPhotoAssetVo queryById(Long id);

    TableDataInfo<YyPhotoAssetVo> queryPageList(YyPhotoAssetBo bo, PageQuery pageQuery);

    List<YyPhotoAssetVo> queryList(YyPhotoAssetBo bo);

    TableDataInfo<YyPhotoResourceRowVo> queryResourcePageList(YyPhotoAssetBo bo, PageQuery pageQuery);

    Boolean insertByBo(YyPhotoAssetBo bo);

    Boolean updateByBo(YyPhotoAssetBo bo);

    Boolean batchUpdateResources(YyPhotoAssetBatchUpdateBo bo);

    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
