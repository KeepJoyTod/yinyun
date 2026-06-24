package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyPhotoAccessLogBo;
import org.dromara.yy.domain.vo.YyPhotoAccessLogVo;

import java.util.List;

/**
 * 客户取片访问日志Service接口
 */
public interface IYyPhotoAccessLogService {

    /**
     * 分页查询访问日志
     */
    TableDataInfo<YyPhotoAccessLogVo> queryPageList(YyPhotoAccessLogBo bo, PageQuery pageQuery);

    /**
     * 查询访问日志列表
     */
    List<YyPhotoAccessLogVo> queryList(YyPhotoAccessLogBo bo);
}
