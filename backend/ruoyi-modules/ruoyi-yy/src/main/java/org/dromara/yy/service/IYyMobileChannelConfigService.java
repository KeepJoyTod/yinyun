package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyMobileChannelConfigBo;
import org.dromara.yy.domain.vo.YyMobileChannelConfigVo;

import java.util.Collection;
import java.util.List;

/**
 * 多端预约入口配置Service接口
 */
public interface IYyMobileChannelConfigService {

    YyMobileChannelConfigVo queryById(Long id);

    TableDataInfo<YyMobileChannelConfigVo> queryPageList(YyMobileChannelConfigBo bo, PageQuery pageQuery);

    List<YyMobileChannelConfigVo> queryList(YyMobileChannelConfigBo bo);

    Boolean insertByBo(YyMobileChannelConfigBo bo);

    Boolean updateByBo(YyMobileChannelConfigBo bo);

    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
