import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { YyChannelSyncLogForm, YyChannelSyncLogQuery, YyChannelSyncLogVO } from './types';

export const listYyChannelSyncLog = (query?: YyChannelSyncLogQuery): AxiosPromise<YyChannelSyncLogVO[]> => {
  return request({
    url: '/yy/channelSyncLog/list',
    method: 'get',
    params: query
  });
};

export const getYyChannelSyncLog = (id: string | number): AxiosPromise<YyChannelSyncLogVO> => {
  return request({
    url: '/yy/channelSyncLog/' + id,
    method: 'get'
  });
};

export const addYyChannelSyncLog = (data: YyChannelSyncLogForm) => {
  return request({
    url: '/yy/channelSyncLog',
    method: 'post',
    data
  });
};

export const updateYyChannelSyncLog = (data: YyChannelSyncLogForm) => {
  return request({
    url: '/yy/channelSyncLog',
    method: 'put',
    data
  });
};

export const delYyChannelSyncLog = (ids: string | number | Array<string | number>) => {
  return request({
    url: '/yy/channelSyncLog/' + ids,
    method: 'delete'
  });
};
