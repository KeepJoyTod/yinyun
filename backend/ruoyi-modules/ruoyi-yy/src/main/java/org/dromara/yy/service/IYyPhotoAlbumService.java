package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyPhotoAlbumBo;
import org.dromara.yy.domain.bo.YyPhotoAlbumActionBo;
import org.dromara.yy.domain.vo.YyPhotoAlbumActionResultVo;
import org.dromara.yy.domain.vo.YyPhotoAlbumOperationsSummaryVo;
import org.dromara.yy.domain.vo.YyPhotoAlbumVo;
import org.dromara.yy.domain.YyOrder;

import java.util.Collection;
import java.util.List;

/**
 * 影约云相册Service接口
 */
public interface IYyPhotoAlbumService {

    /**
     * 查询客片相册
     */
    YyPhotoAlbumVo queryById(Long id);

    /**
     * 分页查询客片相册
     */
    TableDataInfo<YyPhotoAlbumVo> queryPageList(YyPhotoAlbumBo bo, PageQuery pageQuery);

    /**
     * 查询客片相册列表
     */
    List<YyPhotoAlbumVo> queryList(YyPhotoAlbumBo bo);

    /**
     * 批量查询相册运营排障聚合信息
     */
    List<YyPhotoAlbumOperationsSummaryVo> queryOperationsSummary(Collection<Long> albumIds);

    /**
     * 后台确认客户已完成选片。
     */
    YyPhotoAlbumActionResultVo confirmSelection(Long albumId, YyPhotoAlbumActionBo actionBo);

    /**
     * 标记相册已完成最终交付。
     */
    YyPhotoAlbumActionResultVo deliverAlbum(Long albumId, YyPhotoAlbumActionBo actionBo);

    /**
     * 记录客户通知动作；通知通道未接入时返回 fallback 审计信息。
     */
    YyPhotoAlbumActionResultVo notifyAlbum(Long albumId, YyPhotoAlbumActionBo actionBo);

    /**
     * 按订单幂等创建或修复客户取片相册占位。
     */
    YyPhotoAlbumVo upsertPlaceholderForOrder(YyOrder order, String channelType, String externalOrderId, String bookId, String certificateCode);

    /**
     * 新增客片相册
     */
    Boolean insertByBo(YyPhotoAlbumBo bo);

    /**
     * 修改客片相册
     */
    Boolean updateByBo(YyPhotoAlbumBo bo);

    /**
     * 校验并批量删除客片相册
     */
    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
