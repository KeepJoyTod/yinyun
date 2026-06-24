import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const apiRoot = path.join(root, 'src', 'api', 'yy');

const entities = [
  api('store', 'YyStore', '门店', [
    id(), str('storeCode'), str('storeName'), str('status'), str('phone'), str('address'), str('businessHours'), num('sort'), str('remark')
  ], ['storeCode', 'storeName', 'status', 'address']),
  api('product', 'YyProduct', '产品', [
    id(), key('storeId'), str('productType'), str('productName'), num('price'), num('durationMinutes'), num('selectionPrice'), str('albumProductName'), str('status'), num('sort'), str('remark')
  ], ['storeId', 'productType', 'productName', 'albumProductName', 'status']),
  api('order', 'YyOrder', '预约订单', [
    id(), key('storeId'), str('orderNo'), str('customerName'), str('customerPhone'), str('source'), str('bookingMethod'), date('orderTime'), date('arrivalTime'), str('status'), str('workstationNo'), str('externalOrderId'), str('remark')
  ], ['storeId', 'orderNo', 'customerName', 'customerPhone', 'source', 'bookingMethod', 'status', 'externalOrderId']),
  api('photoAlbum', 'YyPhotoAlbum', '客片相册', [
    id(), key('storeId'), key('orderId'), str('albumName'), str('publicToken'), str('selectionStatus'), date('expireTime'), str('remark')
  ], ['storeId', 'orderId', 'albumName', 'selectionStatus']),
  api('photoAsset', 'YyPhotoAsset', '底片', [
    id(), key('storeId'), key('albumId'), str('fileName'), str('fileUrl'), num('sort'), str('isSelected'), str('visible'), str('remark')
  ], ['storeId', 'albumId', 'fileName', 'isSelected', 'visible']),
  api('channelPlugin', 'YyChannelPlugin', '渠道插件', [
    id(), str('channelType'), str('pluginName'), str('enabled'), str('authStatus'), str('openTip'), date('lastSyncTime'), str('remark')
  ], ['channelType', 'pluginName', 'enabled', 'authStatus']),
  api('channelAccount', 'YyChannelAccount', '渠道授权账号', [
    id(), key('storeId'), str('channelType'), str('accountName'), str('appKey'), str('accessTokenEnc'), str('refreshTokenEnc'), date('expiresAt'), str('status'), str('remark')
  ], ['storeId', 'channelType', 'accountName', 'status']),
  api('channelProductMapping', 'YyChannelProductMapping', '渠道商品映射', [
    id(), key('storeId'), key('productId'), str('channelType'), str('externalProductId'), str('externalSkuId'), str('externalName'), str('mappingStatus'), str('remark')
  ], ['storeId', 'productId', 'channelType', 'externalProductId', 'externalName', 'mappingStatus']),
  api('channelOrderMapping', 'YyChannelOrderMapping', '渠道订单映射', [
    id(), key('storeId'), key('orderId'), str('channelType'), str('externalOrderId'), str('externalStatus'), str('syncStatus'), str('rawPayload'), str('remark')
  ], ['storeId', 'orderId', 'channelType', 'externalOrderId', 'externalStatus', 'syncStatus']),
  api('channelSyncLog', 'YyChannelSyncLog', '渠道同步日志', [
    id(), key('storeId'), str('channelType'), str('apiName'), str('requestId'), str('success'), str('errorMessage'), num('durationMs'), str('retryable'), str('remark')
  ], ['storeId', 'channelType', 'apiName', 'requestId', 'success', 'retryable'])
];

for (const entity of entities) {
  writeTypes(entity);
  writeIndex(entity);
}

function api(pathName, typeName, title, fields, queryFields) {
  return { pathName, typeName, title, fields, queryFields };
}

function id() {
  return { name: 'id', type: 'string | number' };
}

function key(name) {
  return { name, type: 'string | number' };
}

function str(name) {
  return { name, type: 'string' };
}

function num(name) {
  return { name, type: 'number' };
}

function date(name) {
  return { name, type: 'string' };
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content.replace(/\n/g, '\r\n'), 'utf8');
}

function writeTypes(entity) {
  const fields = entity.fields.map((field) => `  ${field.name}: ${field.type};`).join('\n');
  const formFields = entity.fields.map((field) => `  ${field.name}${field.name === 'id' ? '?' : ''}: ${field.type}${field.name === 'id' ? ' | undefined' : ''};`).join('\n');
  const queryFields = entity.queryFields
    .map((name) => entity.fields.find((field) => field.name === name))
    .filter(Boolean)
    .map((field) => `  ${field.name}?: ${field.type};`)
    .join('\n');
  write(path.join(apiRoot, entity.pathName, 'types.ts'), `export interface ${entity.typeName}VO extends BaseEntity {
${fields}
  tenantId?: string;
}

export interface ${entity.typeName}Form {
${formFields}
}

export interface ${entity.typeName}Query extends PageQuery {
${queryFields}
}
`);
}

function writeIndex(entity) {
  write(path.join(apiRoot, entity.pathName, 'index.ts'), `import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { ${entity.typeName}Form, ${entity.typeName}Query, ${entity.typeName}VO } from './types';

export const list${entity.typeName} = (query?: ${entity.typeName}Query): AxiosPromise<${entity.typeName}VO[]> => {
  return request({
    url: '/yy/${entity.pathName}/list',
    method: 'get',
    params: query
  });
};

export const get${entity.typeName} = (id: string | number): AxiosPromise<${entity.typeName}VO> => {
  return request({
    url: '/yy/${entity.pathName}/' + id,
    method: 'get'
  });
};

export const add${entity.typeName} = (data: ${entity.typeName}Form) => {
  return request({
    url: '/yy/${entity.pathName}',
    method: 'post',
    data
  });
};

export const update${entity.typeName} = (data: ${entity.typeName}Form) => {
  return request({
    url: '/yy/${entity.pathName}',
    method: 'put',
    data
  });
};

export const del${entity.typeName} = (ids: string | number | Array<string | number>) => {
  return request({
    url: '/yy/${entity.pathName}/' + ids,
    method: 'delete'
  });
};
`);
}
