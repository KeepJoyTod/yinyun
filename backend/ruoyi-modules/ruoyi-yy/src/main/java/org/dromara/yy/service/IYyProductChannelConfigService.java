package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyProductChannelConfigBo;
import org.dromara.yy.domain.vo.YyProductChannelConfigVo;

import java.util.Collection;
import java.util.List;

public interface IYyProductChannelConfigService {
    YyProductChannelConfigVo queryById(Long id);

    TableDataInfo<YyProductChannelConfigVo> queryPageList(YyProductChannelConfigBo bo, PageQuery pageQuery);

    List<YyProductChannelConfigVo> queryList(YyProductChannelConfigBo bo);

    Boolean insertByBo(YyProductChannelConfigBo bo);

    Boolean updateByBo(YyProductChannelConfigBo bo);

    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
