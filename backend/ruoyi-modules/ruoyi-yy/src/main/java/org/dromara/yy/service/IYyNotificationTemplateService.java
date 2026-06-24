package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyNotificationTemplateBo;
import org.dromara.yy.domain.vo.YyNotificationTemplateVo;

import java.util.Collection;
import java.util.List;

/**
 * 通知模板Service接口
 */
public interface IYyNotificationTemplateService {

    YyNotificationTemplateVo queryById(Long id);

    TableDataInfo<YyNotificationTemplateVo> queryPageList(YyNotificationTemplateBo bo, PageQuery pageQuery);

    List<YyNotificationTemplateVo> queryList(YyNotificationTemplateBo bo);

    Boolean insertByBo(YyNotificationTemplateBo bo);

    Boolean updateByBo(YyNotificationTemplateBo bo);

    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
