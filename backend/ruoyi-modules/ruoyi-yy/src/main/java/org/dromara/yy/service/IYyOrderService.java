package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.ClientBookingIntentRequest;
import org.dromara.yy.domain.bo.YyOrderBo;
import org.dromara.yy.domain.bo.YyOrderCopyBo;
import org.dromara.yy.domain.bo.YyStaffBookingCreateBo;
import org.dromara.yy.domain.vo.ClientBookingIntentVo;
import org.dromara.yy.domain.vo.ClientOrderLinkVo;
import org.dromara.yy.domain.vo.ClientOrderTokenVo;
import org.dromara.yy.domain.vo.YyMobileOrderVo;
import org.dromara.yy.domain.vo.YyOrderVo;
import org.dromara.yy.domain.vo.YyPhotoAlbumVo;

import java.util.Collection;
import java.util.List;

/**
 * 影约云预约订单Service接口
 */
public interface IYyOrderService {

    /**
     * 查询预约订单
     */
    YyOrderVo queryById(Long id);

    /**
     * 分页查询预约订单
     */
    TableDataInfo<YyOrderVo> queryPageList(YyOrderBo bo, PageQuery pageQuery);

    /**
     * 查询预约订单列表
     */
    List<YyOrderVo> queryList(YyOrderBo bo);

    /**
     * 移动端按手机号查询本地订单状态。
     */
    List<YyMobileOrderVo> queryMobileOrdersByPhone(Long storeId, String phone, String phoneLast4);

    /**
     * 客户端按完整手机号查询订单取片/详情链接。
     */
    List<ClientOrderLinkVo> queryClientOrderLinksByPhone(Long storeId, String phone, String phoneLast4);

    /**
     * 客户端校验手机号后签发短期订单访问令牌。
     */
    ClientOrderTokenVo verifyClientOrderAccess(Long storeId, String phone, String phoneLast4);

    /**
     * 客户端通过短期订单访问令牌查询订单列表。
     */
    List<ClientOrderLinkVo> queryClientOrderLinksByToken(String clientOrderToken);

    /**
     * 客户端通过短期订单访问令牌查询单个订单。
     */
    ClientOrderLinkVo queryClientOrderLinkByToken(String orderNo, String clientOrderToken);

    /**
     * 客户电脑网页提交预约意向。
     */
    ClientBookingIntentVo createClientBookingIntent(ClientBookingIntentRequest request, String ip);

    /**
     * 幂等修复订单取片相册占位。
     */
    YyPhotoAlbumVo repairPhotoAlbumPlaceholder(Long orderId);

    /**
     * 工作台订单状态流转，使用 expectedStatus 防止并发覆盖。
     */
    YyOrderVo transitionStatus(Long id, String expectedStatus, String targetStatus, String remark);

    /**
     * 工作台订单改期，复用统一库存占用与释放逻辑。
     */
    YyOrderVo reschedule(Long id, String expectedStatus, java.util.Date arrivalTime, Long serviceGroupId,
                         String slotDate, String slotStartTime, String slotEndTime, String remark);

    /**
     * 店员工作台新增预约并占用统一时段库存。
     */
    YyOrderVo createStaffBooking(YyStaffBookingCreateBo bo);
    YyOrderVo copyOrder(Long sourceOrderId, YyOrderCopyBo bo);

    /**
     * 新增预约订单
     */
    Boolean insertByBo(YyOrderBo bo);

    /**
     * 修改预约订单
     */
    Boolean updateByBo(YyOrderBo bo);

    /**
     * 校验并批量删除预约订单
     */
    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
