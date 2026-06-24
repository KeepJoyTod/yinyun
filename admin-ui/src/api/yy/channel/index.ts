import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type {
  YyChannelAcceptanceCaseVO,
  YyChannelApiResultVO,
  YyChannelAutoSyncStatusVO,
  YyChannelEventInboxQuery,
  YyChannelEventInboxStatusVO,
  YyChannelEventInboxVO,
  YyChannelInventoryQuery,
  YyChannelOrderQuery,
  YyChannelOrderVO,
  YyChannelSyncHealthVO,
  YyChannelSyncResultVO
} from './types';

export const searchYyChannelOrders = (channelType: string, query?: YyChannelOrderQuery): AxiosPromise<YyChannelOrderVO[]> => {
  return request({
    url: `/yy/channel/${channelType}/orders`,
    method: 'get',
    params: query
  });
};

export const getYyChannelOrderDetail = (channelType: string, externalOrderId: string): AxiosPromise<YyChannelOrderVO> => {
  return request({
    url: `/yy/channel/${channelType}/orders/${externalOrderId}`,
    method: 'get'
  });
};

export const bindYyChannelOrder = (channelType: string, data?: YyChannelOrderQuery): AxiosPromise<YyChannelOrderVO> => {
  return request({
    url: `/yy/channel/${channelType}/orders/bind`,
    method: 'post',
    data
  });
};

export const syncYyChannelOrders = (channelType: string, data?: YyChannelOrderQuery): AxiosPromise<YyChannelSyncResultVO> => {
  return request({
    url: `/yy/channel/${channelType}/orders/sync`,
    method: 'post',
    data
  });
};

export const listYyChannelAcceptanceCases = (channelType: string): AxiosPromise<YyChannelAcceptanceCaseVO[]> => {
  return request({
    url: `/yy/channel/${channelType}/acceptance-cases`,
    method: 'get'
  });
};

export const getYyChannelAutoSyncStatus = (channelType: string): AxiosPromise<YyChannelAutoSyncStatusVO> => {
  return request({
    url: `/yy/channel/${channelType}/auto-sync/status`,
    method: 'get'
  });
};

export const getYyChannelSyncHealth = (channelType: string): AxiosPromise<YyChannelSyncHealthVO> => {
  return request({
    url: `/yy/channel/${channelType}/sync-health`,
    method: 'get'
  });
};

export const listYyChannelEventInbox = (channelType: string, query?: YyChannelEventInboxQuery): AxiosPromise<any> => {
  return request({
    url: `/yy/channel/${channelType}/event-inbox/list`,
    method: 'get',
    params: query
  });
};

export const getYyChannelEventInboxStatus = (channelType: string): AxiosPromise<YyChannelEventInboxStatusVO> => {
  return request({
    url: `/yy/channel/${channelType}/event-inbox/status`,
    method: 'get'
  });
};

export const retryYyChannelEventInbox = (channelType: string, id: string | number): AxiosPromise<YyChannelEventInboxVO> => {
  return request({
    url: `/yy/channel/${channelType}/event-inbox/${id}/retry`,
    method: 'post'
  });
};

export const getYyChannelClientToken = (channelType: string, query?: YyChannelOrderQuery): AxiosPromise<YyChannelApiResultVO> => {
  return request({
    url: `/yy/channel/${channelType}/client-token`,
    method: 'get',
    params: query
  });
};

export const getYyChannelServiceStatus = (channelType: string, query?: YyChannelOrderQuery): AxiosPromise<YyChannelApiResultVO> => {
  return request({
    url: `/yy/channel/${channelType}/service-status`,
    method: 'get',
    params: query
  });
};

export const getYyChannelPurchaseList = (channelType: string, query?: YyChannelOrderQuery): AxiosPromise<YyChannelApiResultVO> => {
  return request({
    url: `/yy/channel/${channelType}/purchase-list`,
    method: 'get',
    params: query
  });
};

export const postYyChannelWebhook = (channelType: string, payload?: string) => {
  return request({
    url: `/yy/channel/${channelType}/webhook`,
    method: 'post',
    data: payload || ''
  });
};

export const postYyChannelConfirmOrder = (channelType: string, data?: YyChannelOrderQuery) => {
  return request({
    url: `/yy/channel/${channelType}/confirm`,
    method: 'post',
    data
  });
};

export const postYyChannelVerifyOrder = (channelType: string, data?: YyChannelOrderQuery) => {
  return request({
    url: `/yy/channel/${channelType}/verify`,
    method: 'post',
    data
  });
};

export const postYyChannelInventorySkuUpsert = (channelType: string, data?: YyChannelInventoryQuery): AxiosPromise<YyChannelApiResultVO> => {
  return request({
    url: `/yy/channel/${channelType}/reservation/inventory-sku/upsert`,
    method: 'post',
    data
  });
};

export const postYyChannelRealtimeStockSave = (channelType: string, data?: YyChannelInventoryQuery): AxiosPromise<YyChannelApiResultVO> => {
  return request({
    url: `/yy/channel/${channelType}/reservation/stock/save`,
    method: 'post',
    data
  });
};

export const postYyChannelStockTrigger = (channelType: string, data?: YyChannelInventoryQuery): AxiosPromise<YyChannelApiResultVO> => {
  return request({
    url: `/yy/channel/${channelType}/reservation/stock/trigger`,
    method: 'post',
    data
  });
};

export const postYyChannelTimeStockSave = (channelType: string, data?: YyChannelInventoryQuery): AxiosPromise<YyChannelApiResultVO> => {
  return request({
    url: `/yy/channel/${channelType}/reservation/time-stock/save`,
    method: 'post',
    data
  });
};

export const getYyChannelTimeStock = (channelType: string, query?: YyChannelInventoryQuery): AxiosPromise<YyChannelApiResultVO> => {
  return request({
    url: `/yy/channel/${channelType}/reservation/time-stock/get`,
    method: 'get',
    params: query
  });
};
