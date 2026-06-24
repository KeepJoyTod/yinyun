package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyPhotoTagBo;
import org.dromara.yy.domain.vo.YyPhotoTagVo;

import java.util.Collection;

/**
 * 璧勬簮鏍囩 Service 鎺ュ彛
 */
public interface IYyPhotoTagService {

    TableDataInfo<YyPhotoTagVo> queryPageList(YyPhotoTagBo bo, PageQuery pageQuery);

    Boolean insertByBo(YyPhotoTagBo bo);

    Boolean updateByBo(YyPhotoTagBo bo);

    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
