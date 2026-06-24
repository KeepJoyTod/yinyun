package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyNotificationLogBo;
import org.dromara.yy.domain.vo.YyNotificationLogVo;

import java.util.Collection;
import java.util.List;

/**
 * 通知发送日志Service接口
 */
public interface IYyNotificationLogService {

    YyNotificationLogVo queryById(Long id);

    TableDataInfo<YyNotificationLogVo> queryPageList(YyNotificationLogBo bo, PageQuery pageQuery);

    List<YyNotificationLogVo> queryList(YyNotificationLogBo bo);

    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
