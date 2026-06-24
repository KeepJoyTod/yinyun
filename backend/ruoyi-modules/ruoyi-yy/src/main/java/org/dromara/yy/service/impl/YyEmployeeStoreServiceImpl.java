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
import org.dromara.yy.domain.YyEmployeeStore;
import org.dromara.yy.domain.bo.YyEmployeeStoreBo;
import org.dromara.yy.domain.vo.YyEmployeeStoreVo;
import org.dromara.yy.mapper.YyEmployeeStoreMapper;
import org.dromara.yy.service.IYyEmployeeStoreService;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

/**
 * 影约云员工-门店关联Service业务层处理
 */
@RequiredArgsConstructor
@Service
public class YyEmployeeStoreServiceImpl implements IYyEmployeeStoreService {

    private final YyEmployeeStoreMapper baseMapper;

    @Override
    public YyEmployeeStoreVo queryById(Long id) {
        return baseMapper.selectVoById(id);
    }

    @Override
    public TableDataInfo<YyEmployeeStoreVo> queryPageList(YyEmployeeStoreBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<YyEmployeeStore> lqw = buildQueryWrapper(bo);
        Page<YyEmployeeStoreVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    @Override
    public List<YyEmployeeStoreVo> queryList(YyEmployeeStoreBo bo) {
        return baseMapper.selectVoList(buildQueryWrapper(bo));
    }

    private LambdaQueryWrapper<YyEmployeeStore> buildQueryWrapper(YyEmployeeStoreBo bo) {
        LambdaQueryWrapper<YyEmployeeStore> lqw = Wrappers.lambdaQuery();
        lqw.eq(bo.getEmployeeId() != null, YyEmployeeStore::getEmployeeId, bo.getEmployeeId());
        lqw.eq(bo.getStoreId() != null, YyEmployeeStore::getStoreId, bo.getStoreId());
        lqw.eq(StringUtils.isNotBlank(bo.getIsPrimary()), YyEmployeeStore::getIsPrimary, bo.getIsPrimary());
        lqw.eq(StringUtils.isNotBlank(bo.getRoleType()), YyEmployeeStore::getRoleType, bo.getRoleType());
        lqw.eq(StringUtils.isNotBlank(bo.getStatus()), YyEmployeeStore::getStatus, bo.getStatus());
        lqw.orderByAsc(YyEmployeeStore::getSort);
        lqw.orderByAsc(YyEmployeeStore::getId);
        return lqw;
    }

    @Override
    public Boolean insertByBo(YyEmployeeStoreBo bo) {
        YyEmployeeStore add = BeanUtil.toBean(bo, YyEmployeeStore.class);
        validEntityBeforeSave(add);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(YyEmployeeStoreBo bo) {
        YyEmployeeStore update = BeanUtil.toBean(bo, YyEmployeeStore.class);
        validEntityBeforeSave(update);
        return baseMapper.updateById(update) > 0;
    }

    private void validEntityBeforeSave(YyEmployeeStore entity) {
        // 预留主门店唯一性与员工-门店重复校验。
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        if (isValid) {
            List<YyEmployeeStore> list = baseMapper.selectByIds(ids);
            if (list.size() != ids.size()) {
                throw new ServiceException("您没有删除权限!");
            }
        }
        return baseMapper.deleteByIds(ids) > 0;
    }

    @Override
    public List<YyEmployeeStoreVo> listStoreScopes(Long employeeId) {
        return baseMapper.selectVoList(
            Wrappers.<YyEmployeeStore>lambdaQuery()
                .eq(YyEmployeeStore::getEmployeeId, employeeId)
                .eq(YyEmployeeStore::getDelFlag, "0")
                .orderByAsc(YyEmployeeStore::getSort));
    }
}
