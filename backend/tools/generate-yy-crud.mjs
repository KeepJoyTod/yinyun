import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const javaRoot = path.join(root, 'ruoyi-modules', 'ruoyi-yy', 'src', 'main', 'java', 'org', 'dromara', 'yy');
const mapperRoot = path.join(root, 'ruoyi-modules', 'ruoyi-yy', 'src', 'main', 'resources', 'mapper', 'yy');

const entities = [
  {
    className: 'YyStore',
    table: 'yy_store',
    title: '门店管理',
    comment: '影约云门店',
    path: 'store',
    permission: 'yy:store',
    order: [{ field: 'sort', direction: 'Asc' }, { field: 'id', direction: 'Asc' }],
    fields: [
      s('storeCode', 'String', '门店编码', { required: true, query: 'eq' }),
      s('storeName', 'String', '门店名称', { required: true, query: 'like' }),
      s('status', 'String', '营业状态', { query: 'eq' }),
      s('phone', 'String', '联系电话'),
      s('address', 'String', '门店地址', { query: 'like' }),
      s('businessHours', 'String', '营业时间'),
      n('sort', 'Integer', '排序'),
      s('remark', 'String', '备注')
    ]
  },
  {
    className: 'YyProduct',
    table: 'yy_product',
    title: '产品管理',
    comment: '影约云产品',
    path: 'product',
    permission: 'yy:product',
    order: [{ field: 'sort', direction: 'Asc' }, { field: 'id', direction: 'Asc' }],
    fields: [
      n('storeId', 'Long', '门店ID', { query: 'eq' }),
      s('productType', 'String', '产品类型', { required: true, query: 'eq' }),
      s('productName', 'String', '产品名称', { required: true, query: 'like' }),
      n('price', 'BigDecimal', '销售价'),
      n('durationMinutes', 'Integer', '服务时长'),
      n('selectionPrice', 'BigDecimal', '选片单价'),
      s('albumProductName', 'String', '入册产品', { query: 'like' }),
      s('status', 'String', '状态', { query: 'eq' }),
      n('sort', 'Integer', '排序'),
      s('remark', 'String', '备注')
    ]
  },
  {
    className: 'YyOrder',
    table: 'yy_order',
    title: '预约订单',
    comment: '影约云预约订单',
    path: 'order',
    permission: 'yy:order',
    order: [{ field: 'arrivalTime', direction: 'Desc' }, { field: 'id', direction: 'Desc' }],
    fields: [
      n('storeId', 'Long', '门店ID', { required: true, query: 'eq' }),
      s('orderNo', 'String', '订单编号', { required: true, query: 'like' }),
      s('customerName', 'String', '客户姓名', { query: 'like' }),
      s('customerPhone', 'String', '客户手机号', { query: 'like' }),
      s('source', 'String', '订单来源', { query: 'eq' }),
      s('bookingMethod', 'String', '预约方式', { query: 'eq' }),
      d('orderTime', '下单时间'),
      d('arrivalTime', '到店时间'),
      s('status', 'String', '订单状态', { query: 'eq' }),
      s('workstationNo', 'String', '工位'),
      s('externalOrderId', 'String', '外部订单号', { query: 'like' }),
      s('remark', 'String', '备注')
    ]
  },
  {
    className: 'YyPhotoAlbum',
    table: 'yy_photo_album',
    title: '客片相册',
    comment: '影约云相册',
    path: 'photoAlbum',
    permission: 'yy:photo',
    order: [{ field: 'id', direction: 'Desc' }],
    fields: [
      n('storeId', 'Long', '门店ID', { required: true, query: 'eq' }),
      n('orderId', 'Long', '订单ID', { query: 'eq' }),
      s('albumName', 'String', '相册名称', { required: true, query: 'like' }),
      s('publicToken', 'String', '公开选片令牌'),
      s('selectionStatus', 'String', '选片状态', { query: 'eq' }),
      d('expireTime', '过期时间'),
      s('remark', 'String', '备注')
    ]
  },
  {
    className: 'YyPhotoAsset',
    table: 'yy_photo_asset',
    title: '底片列表',
    comment: '影约云底片',
    path: 'photoAsset',
    permission: 'yy:photo',
    order: [{ field: 'sort', direction: 'Asc' }, { field: 'id', direction: 'Asc' }],
    fields: [
      n('storeId', 'Long', '门店ID', { required: true, query: 'eq' }),
      n('albumId', 'Long', '相册ID', { required: true, query: 'eq' }),
      s('fileName', 'String', '文件名', { required: true, query: 'like' }),
      s('fileUrl', 'String', '文件地址', { required: true }),
      n('sort', 'Integer', '排序'),
      s('isSelected', 'String', '是否已选', { query: 'eq' }),
      s('visible', 'String', '客户可见', { query: 'eq' }),
      s('remark', 'String', '备注')
    ]
  },
  {
    className: 'YyChannelPlugin',
    table: 'yy_channel_plugin',
    title: '渠道插件',
    comment: '影约云渠道插件',
    path: 'channelPlugin',
    permission: 'yy:channel',
    order: [{ field: 'id', direction: 'Asc' }],
    fields: [
      s('channelType', 'String', '渠道类型', { required: true, query: 'eq' }),
      s('pluginName', 'String', '插件名称', { required: true, query: 'like' }),
      s('enabled', 'String', '是否启用', { query: 'eq' }),
      s('authStatus', 'String', '授权状态', { query: 'eq' }),
      s('openTip', 'String', '未开通提示'),
      d('lastSyncTime', '最后同步时间'),
      s('remark', 'String', '备注')
    ]
  },
  {
    className: 'YyChannelAccount',
    table: 'yy_channel_account',
    title: '渠道授权账号',
    comment: '影约云渠道授权账号',
    path: 'channelAccount',
    permission: 'yy:channel',
    order: [{ field: 'id', direction: 'Desc' }],
    fields: [
      n('storeId', 'Long', '门店ID', { query: 'eq' }),
      s('channelType', 'String', '渠道类型', { required: true, query: 'eq' }),
      s('accountName', 'String', '授权账号', { query: 'like' }),
      s('appKey', 'String', '应用Key'),
      s('accessTokenEnc', 'String', '加密访问令牌'),
      s('refreshTokenEnc', 'String', '加密刷新令牌'),
      d('expiresAt', '过期时间'),
      s('status', 'String', '授权状态', { query: 'eq' }),
      s('remark', 'String', '备注')
    ]
  },
  {
    className: 'YyChannelProductMapping',
    table: 'yy_channel_product_mapping',
    title: '渠道商品映射',
    comment: '影约云渠道商品映射',
    path: 'channelProductMapping',
    permission: 'yy:channel',
    order: [{ field: 'id', direction: 'Desc' }],
    fields: [
      n('storeId', 'Long', '门店ID', { query: 'eq' }),
      n('productId', 'Long', '本地产品ID', { required: true, query: 'eq' }),
      s('channelType', 'String', '渠道类型', { required: true, query: 'eq' }),
      s('externalProductId', 'String', '外部商品ID', { query: 'like' }),
      s('externalSkuId', 'String', '外部SKU'),
      s('externalName', 'String', '外部商品名', { query: 'like' }),
      s('mappingStatus', 'String', '映射状态', { query: 'eq' }),
      s('remark', 'String', '备注')
    ]
  },
  {
    className: 'YyChannelOrderMapping',
    table: 'yy_channel_order_mapping',
    title: '渠道订单映射',
    comment: '影约云渠道订单映射',
    path: 'channelOrderMapping',
    permission: 'yy:channel',
    order: [{ field: 'id', direction: 'Desc' }],
    fields: [
      n('storeId', 'Long', '门店ID', { query: 'eq' }),
      n('orderId', 'Long', '本地订单ID', { query: 'eq' }),
      s('channelType', 'String', '渠道类型', { required: true, query: 'eq' }),
      s('externalOrderId', 'String', '外部订单号', { required: true, query: 'like' }),
      s('externalStatus', 'String', '外部状态', { query: 'eq' }),
      s('syncStatus', 'String', '同步状态', { query: 'eq' }),
      s('rawPayload', 'String', '原始报文'),
      s('remark', 'String', '备注')
    ]
  },
  {
    className: 'YyChannelSyncLog',
    table: 'yy_channel_sync_log',
    title: '渠道同步日志',
    comment: '影约云渠道同步日志',
    path: 'channelSyncLog',
    permission: 'yy:channel',
    order: [{ field: 'createTime', direction: 'Desc' }, { field: 'id', direction: 'Desc' }],
    fields: [
      n('storeId', 'Long', '门店ID', { query: 'eq' }),
      s('channelType', 'String', '渠道类型', { required: true, query: 'eq' }),
      s('apiName', 'String', '接口名', { required: true, query: 'like' }),
      s('requestId', 'String', '请求ID', { query: 'like' }),
      s('success', 'String', '是否成功', { query: 'eq' }),
      s('errorMessage', 'String', '错误信息'),
      n('durationMs', 'Long', '耗时毫秒'),
      s('retryable', 'String', '是否可重试', { query: 'eq' }),
      s('remark', 'String', '备注')
    ]
  }
];

for (const entity of entities) {
  generateEntity(entity);
  generateBo(entity);
  generateVo(entity);
  generateMapper(entity);
  generateService(entity);
  generateServiceImpl(entity);
  generateController(entity);
  generateMapperXml(entity);
}

function s(name, type, comment, options = {}) {
  return field(name, type, comment, options);
}

function n(name, type, comment, options = {}) {
  return field(name, type, comment, options);
}

function d(name, comment, options = {}) {
  return field(name, 'Date', comment, options);
}

function field(name, type, comment, options = {}) {
  return { name, type, comment, ...options };
}

function cap(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function low(value) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content.replace(/\n/g, '\r\n'), 'utf8');
}

function fieldDecl(field, indent = '    ') {
  return `${indent}/**\n${indent} * ${field.comment}\n${indent} */\n${indent}private ${field.type} ${field.name};`;
}

function boFieldDecl(field) {
  const annotations = [];
  if (field.type === 'Date') {
    annotations.push('    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")');
  }
  if (field.required) {
    const annotation = field.type === 'String'
      ? `    @NotBlank(message = "${field.comment}不能为空", groups = { AddGroup.class, EditGroup.class })`
      : `    @NotNull(message = "${field.comment}不能为空", groups = { AddGroup.class, EditGroup.class })`;
    annotations.push(annotation);
  }
  return `${annotations.join('\n')}${annotations.length ? '\n' : ''}${fieldDecl(field)}`;
}

function voFieldDecl(field) {
  const annotations = [];
  if (field.type === 'Date') {
    annotations.push('    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")');
    annotations.push('    @DateTimeFormat("yyyy-MM-dd HH:mm:ss")');
  }
  annotations.push(`    @ExcelProperty(value = "${field.comment}")`);
  return `${annotations.join('\n')}\n${fieldDecl(field)}`;
}

function generateEntity(entity) {
  const hasBigDecimal = entity.fields.some((f) => f.type === 'BigDecimal');
  const hasDate = entity.fields.some((f) => f.type === 'Date');
  const imports = [
    'import com.baomidou.mybatisplus.annotation.TableId;',
    'import com.baomidou.mybatisplus.annotation.TableLogic;',
    'import com.baomidou.mybatisplus.annotation.TableName;',
    'import lombok.Data;',
    'import lombok.EqualsAndHashCode;',
    'import org.dromara.common.tenant.core.TenantEntity;',
    '',
    'import java.io.Serial;',
    hasBigDecimal ? 'import java.math.BigDecimal;' : null,
    hasDate ? 'import java.util.Date;' : null
  ].filter(Boolean).join('\n');
  const fields = entity.fields.map((f) => fieldDecl(f)).join('\n\n');
  write(path.join(javaRoot, 'domain', `${entity.className}.java`), `package org.dromara.yy.domain;

${imports}

/**
 * ${entity.comment}对象 ${entity.table}
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("${entity.table}")
public class ${entity.className} extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @TableId(value = "id")
    private Long id;

${fields}

    /**
     * 删除标志
     */
    @TableLogic
    private String delFlag;
}
`);
}

function generateBo(entity) {
  const hasBigDecimal = entity.fields.some((f) => f.type === 'BigDecimal');
  const hasDate = entity.fields.some((f) => f.type === 'Date');
  const imports = [
    hasDate ? 'import com.fasterxml.jackson.annotation.JsonFormat;' : null,
    'import io.github.linpeilie.annotations.AutoMapper;',
    'import jakarta.validation.constraints.NotBlank;',
    'import jakarta.validation.constraints.NotNull;',
    'import lombok.Data;',
    'import lombok.EqualsAndHashCode;',
    'import org.dromara.common.core.validate.AddGroup;',
    'import org.dromara.common.core.validate.EditGroup;',
    'import org.dromara.common.mybatis.core.domain.BaseEntity;',
    `import org.dromara.yy.domain.${entity.className};`,
    '',
    hasBigDecimal ? 'import java.math.BigDecimal;' : null,
    hasDate ? 'import java.util.Date;' : null
  ].filter(Boolean).join('\n');
  const fields = entity.fields.map((f) => boFieldDecl(f)).join('\n\n');
  write(path.join(javaRoot, 'domain', 'bo', `${entity.className}Bo.java`), `package org.dromara.yy.domain.bo;

${imports}

/**
 * ${entity.comment}业务对象 ${entity.table}
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = ${entity.className}.class, reverseConvertGenerate = false)
public class ${entity.className}Bo extends BaseEntity {

    /**
     * 主键
     */
    @NotNull(message = "主键不能为空", groups = { EditGroup.class })
    private Long id;

${fields}
}
`);
}

function generateVo(entity) {
  const hasBigDecimal = entity.fields.some((f) => f.type === 'BigDecimal');
  const hasDate = entity.fields.some((f) => f.type === 'Date');
  const imports = [
    'import cn.idev.excel.annotation.ExcelIgnoreUnannotated;',
    'import cn.idev.excel.annotation.ExcelProperty;',
    hasDate ? 'import cn.idev.excel.annotation.format.DateTimeFormat;' : null,
    hasDate ? 'import com.fasterxml.jackson.annotation.JsonFormat;' : null,
    'import io.github.linpeilie.annotations.AutoMapper;',
    'import lombok.Data;',
    `import org.dromara.yy.domain.${entity.className};`,
    '',
    'import java.io.Serial;',
    'import java.io.Serializable;',
    hasBigDecimal ? 'import java.math.BigDecimal;' : null,
    'import java.util.Date;'
  ].filter(Boolean).join('\n');
  const fields = entity.fields.map((f) => voFieldDecl(f)).join('\n\n');
  write(path.join(javaRoot, 'domain', 'vo', `${entity.className}Vo.java`), `package org.dromara.yy.domain.vo;

${imports}

/**
 * ${entity.comment}视图对象 ${entity.table}
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = ${entity.className}.class)
public class ${entity.className}Vo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @ExcelProperty(value = "主键")
    private Long id;

    /**
     * 租户编号
     */
    private String tenantId;

${fields}

    /**
     * 创建时间
     */
    @ExcelProperty(value = "创建时间")
    private Date createTime;

    /**
     * 更新时间
     */
    @ExcelProperty(value = "更新时间")
    private Date updateTime;
}
`);
}

function generateMapper(entity) {
  write(path.join(javaRoot, 'mapper', `${entity.className}Mapper.java`), `package org.dromara.yy.mapper;

import org.dromara.common.mybatis.core.mapper.BaseMapperPlus;
import org.dromara.yy.domain.${entity.className};
import org.dromara.yy.domain.vo.${entity.className}Vo;

/**
 * ${entity.comment}Mapper接口
 */
public interface ${entity.className}Mapper extends BaseMapperPlus<${entity.className}, ${entity.className}Vo> {
}
`);
}

function generateService(entity) {
  write(path.join(javaRoot, 'service', `I${entity.className}Service.java`), `package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.${entity.className}Bo;
import org.dromara.yy.domain.vo.${entity.className}Vo;

import java.util.Collection;
import java.util.List;

/**
 * ${entity.comment}Service接口
 */
public interface I${entity.className}Service {

    /**
     * 查询${entity.title}
     */
    ${entity.className}Vo queryById(Long id);

    /**
     * 分页查询${entity.title}
     */
    TableDataInfo<${entity.className}Vo> queryPageList(${entity.className}Bo bo, PageQuery pageQuery);

    /**
     * 查询${entity.title}列表
     */
    List<${entity.className}Vo> queryList(${entity.className}Bo bo);

    /**
     * 新增${entity.title}
     */
    Boolean insertByBo(${entity.className}Bo bo);

    /**
     * 修改${entity.title}
     */
    Boolean updateByBo(${entity.className}Bo bo);

    /**
     * 校验并批量删除${entity.title}
     */
    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);
}
`);
}

function queryLine(entity, field) {
  const getter = `get${cap(field.name)}`;
  const entityGetter = `${entity.className}::${getter}`;
  if (field.query === 'like') {
    return `        lqw.like(StringUtils.isNotBlank(bo.${getter}()), ${entityGetter}, bo.${getter}());`;
  }
  if (field.query === 'eq') {
    if (field.type === 'String') {
      return `        lqw.eq(StringUtils.isNotBlank(bo.${getter}()), ${entityGetter}, bo.${getter}());`;
    }
    return `        lqw.eq(bo.${getter}() != null, ${entityGetter}, bo.${getter}());`;
  }
  return null;
}

function orderLine(entity, order) {
  return `        lqw.orderBy${order.direction}(${entity.className}::get${cap(order.field)});`;
}

function generateServiceImpl(entity) {
  const queryLines = entity.fields.map((f) => queryLine(entity, f)).filter(Boolean).join('\n');
  const orderLines = entity.order.map((o) => orderLine(entity, o)).join('\n');
  write(path.join(javaRoot, 'service', 'impl', `${entity.className}ServiceImpl.java`), `package org.dromara.yy.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.${entity.className};
import org.dromara.yy.domain.bo.${entity.className}Bo;
import org.dromara.yy.domain.vo.${entity.className}Vo;
import org.dromara.yy.mapper.${entity.className}Mapper;
import org.dromara.yy.service.I${entity.className}Service;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

/**
 * ${entity.comment}Service业务层处理
 */
@RequiredArgsConstructor
@Service
public class ${entity.className}ServiceImpl implements I${entity.className}Service {

    private final ${entity.className}Mapper baseMapper;

    @Override
    public ${entity.className}Vo queryById(Long id) {
        return baseMapper.selectVoById(id);
    }

    @Override
    public TableDataInfo<${entity.className}Vo> queryPageList(${entity.className}Bo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<${entity.className}> lqw = buildQueryWrapper(bo);
        Page<${entity.className}Vo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    @Override
    public List<${entity.className}Vo> queryList(${entity.className}Bo bo) {
        return baseMapper.selectVoList(buildQueryWrapper(bo));
    }

    private LambdaQueryWrapper<${entity.className}> buildQueryWrapper(${entity.className}Bo bo) {
        LambdaQueryWrapper<${entity.className}> lqw = Wrappers.lambdaQuery();
${queryLines}
${orderLines}
        return lqw;
    }

    @Override
    public Boolean insertByBo(${entity.className}Bo bo) {
        ${entity.className} add = BeanUtil.toBean(bo, ${entity.className}.class);
        validEntityBeforeSave(add);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(${entity.className}Bo bo) {
        ${entity.className} update = BeanUtil.toBean(bo, ${entity.className}.class);
        validEntityBeforeSave(update);
        return baseMapper.updateById(update) > 0;
    }

    private void validEntityBeforeSave(${entity.className} entity) {
        // 预留唯一性、渠道授权、订单状态流转等业务校验。
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        if (isValid) {
            List<${entity.className}> list = baseMapper.selectByIds(ids);
            if (list.size() != ids.size()) {
                throw new ServiceException("您没有删除权限!");
            }
        }
        return baseMapper.deleteByIds(ids) > 0;
    }
}
`);
}

function generateController(entity) {
  const varName = low(entity.className);
  write(path.join(javaRoot, 'controller', `${entity.className}Controller.java`), `package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.excel.utils.ExcelUtil;
import org.dromara.common.idempotent.annotation.RepeatSubmit;
import org.dromara.common.log.annotation.Log;
import org.dromara.common.log.enums.BusinessType;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.web.core.BaseController;
import org.dromara.yy.domain.bo.${entity.className}Bo;
import org.dromara.yy.domain.vo.${entity.className}Vo;
import org.dromara.yy.service.I${entity.className}Service;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ${entity.title}
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/${entity.path}")
public class ${entity.className}Controller extends BaseController {

    private final I${entity.className}Service ${varName}Service;

    /**
     * 查询${entity.title}列表
     */
    @SaCheckPermission("${entity.permission}:list")
    @GetMapping("/list")
    public TableDataInfo<${entity.className}Vo> list(${entity.className}Bo bo, PageQuery pageQuery) {
        return ${varName}Service.queryPageList(bo, pageQuery);
    }

    /**
     * 导出${entity.title}列表
     */
    @SaCheckPermission("${entity.permission}:export")
    @Log(title = "${entity.title}", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(${entity.className}Bo bo, HttpServletResponse response) {
        List<${entity.className}Vo> list = ${varName}Service.queryList(bo);
        ExcelUtil.exportExcel(list, "${entity.title}", ${entity.className}Vo.class, response);
    }

    /**
     * 获取${entity.title}详细信息
     */
    @SaCheckPermission("${entity.permission}:query")
    @GetMapping("/{id}")
    public R<${entity.className}Vo> getInfo(@NotNull(message = "主键不能为空") @PathVariable Long id) {
        return R.ok(${varName}Service.queryById(id));
    }

    /**
     * 新增${entity.title}
     */
    @SaCheckPermission("${entity.permission}:add")
    @Log(title = "${entity.title}", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping()
    public R<Void> add(@Validated(AddGroup.class) @RequestBody ${entity.className}Bo bo) {
        return toAjax(${varName}Service.insertByBo(bo));
    }

    /**
     * 修改${entity.title}
     */
    @SaCheckPermission("${entity.permission}:edit")
    @Log(title = "${entity.title}", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody ${entity.className}Bo bo) {
        return toAjax(${varName}Service.updateByBo(bo));
    }

    /**
     * 删除${entity.title}
     */
    @SaCheckPermission("${entity.permission}:remove")
    @Log(title = "${entity.title}", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空") @PathVariable Long[] ids) {
        return toAjax(${varName}Service.deleteWithValidByIds(List.of(ids), true));
    }
}
`);
}

function generateMapperXml(entity) {
  write(path.join(mapperRoot, `${entity.className}Mapper.xml`), `<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
    PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
    "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="org.dromara.yy.mapper.${entity.className}Mapper">

</mapper>
`);
}
