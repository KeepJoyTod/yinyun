package org.dromara.yy.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.YyChannelAccount;
import org.dromara.yy.domain.bo.YyChannelAccountBo;
import org.dromara.yy.domain.vo.YyChannelAccountVo;
import org.dromara.yy.mapper.YyChannelAccountMapper;
import org.dromara.yy.service.IYyChannelAccountService;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

/**
 * 影约云渠道授权账号Service业务层处理
 */
@RequiredArgsConstructor
@Service
public class YyChannelAccountServiceImpl implements IYyChannelAccountService {

    private static final String SECRET_MASK = "******";

    private final YyChannelAccountMapper baseMapper;

    @Override
    public YyChannelAccountVo queryById(Long id) {
        return maskSecretFields(baseMapper.selectVoById(id));
    }

    @Override
    public TableDataInfo<YyChannelAccountVo> queryPageList(YyChannelAccountBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<YyChannelAccount> lqw = buildQueryWrapper(bo);
        Page<YyChannelAccountVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        result.getRecords().forEach(this::maskSecretFields);
        return TableDataInfo.build(result);
    }

    @Override
    public List<YyChannelAccountVo> queryList(YyChannelAccountBo bo) {
        List<YyChannelAccountVo> list = baseMapper.selectVoList(buildQueryWrapper(bo));
        list.forEach(this::maskSecretFields);
        return list;
    }

    private LambdaQueryWrapper<YyChannelAccount> buildQueryWrapper(YyChannelAccountBo bo) {
        LambdaQueryWrapper<YyChannelAccount> lqw = Wrappers.lambdaQuery();
        lqw.eq(bo.getStoreId() != null, YyChannelAccount::getStoreId, bo.getStoreId());
        lqw.eq(StringUtils.isNotBlank(bo.getChannelType()), YyChannelAccount::getChannelType, bo.getChannelType());
        lqw.like(StringUtils.isNotBlank(bo.getAccountName()), YyChannelAccount::getAccountName, bo.getAccountName());
        lqw.eq(StringUtils.isNotBlank(bo.getStatus()), YyChannelAccount::getStatus, bo.getStatus());
        lqw.orderByDesc(YyChannelAccount::getId);
        return lqw;
    }

    @Override
    public Boolean insertByBo(YyChannelAccountBo bo) {
        YyChannelAccount add = BeanUtil.toBean(bo, YyChannelAccount.class);
        validEntityBeforeSave(add);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(YyChannelAccountBo bo) {
        YyChannelAccount update = BeanUtil.toBean(bo, YyChannelAccount.class);
        preserveSecretFields(update);
        validEntityBeforeSave(update);
        return baseMapper.updateById(update) > 0;
    }

    private void validEntityBeforeSave(YyChannelAccount entity) {
        // 预留唯一性、渠道授权、订单状态流转等业务校验。
    }

    private void preserveSecretFields(YyChannelAccount update) {
        if (update.getId() == null) {
            return;
        }
        YyChannelAccount existing = baseMapper.selectById(update.getId());
        if (existing == null) {
            return;
        }
        if (shouldPreserveSecret(update.getAppSecretEnc())) {
            update.setAppSecretEnc(existing.getAppSecretEnc());
        }
        if (shouldPreserveSecret(update.getAccessTokenEnc())) {
            update.setAccessTokenEnc(existing.getAccessTokenEnc());
        }
        if (shouldPreserveSecret(update.getRefreshTokenEnc())) {
            update.setRefreshTokenEnc(existing.getRefreshTokenEnc());
        }
    }

    private boolean shouldPreserveSecret(String value) {
        return StringUtils.isBlank(value) || SECRET_MASK.equals(value);
    }

    private YyChannelAccountVo maskSecretFields(YyChannelAccountVo vo) {
        if (vo == null) {
            return null;
        }
        vo.setAppSecretEnc(maskIfPresent(vo.getAppSecretEnc()));
        vo.setAccessTokenEnc(maskIfPresent(vo.getAccessTokenEnc()));
        vo.setRefreshTokenEnc(maskIfPresent(vo.getRefreshTokenEnc()));
        return vo;
    }

    private String maskIfPresent(String value) {
        return StringUtils.isBlank(value) ? "" : SECRET_MASK;
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        if (isValid) {
            List<YyChannelAccount> list = baseMapper.selectByIds(ids);
            if (list.size() != ids.size()) {
                throw new ServiceException("您没有删除权限!");
            }
        }
        return baseMapper.deleteByIds(ids) > 0;
    }
}
