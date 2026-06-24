import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { YyChannelPluginForm, YyChannelPluginQuery, YyChannelPluginVO } from './types';

export const listYyChannelPlugin = (query?: YyChannelPluginQuery): AxiosPromise<YyChannelPluginVO[]> => {
  return request({
    url: '/yy/channelPlugin/list',
    method: 'get',
    params: query
  });
};

export const getYyChannelPlugin = (id: string | number): AxiosPromise<YyChannelPluginVO> => {
  return request({
    url: '/yy/channelPlugin/' + id,
    method: 'get'
  });
};

export const addYyChannelPlugin = (data: YyChannelPluginForm) => {
  return request({
    url: '/yy/channelPlugin',
    method: 'post',
    data
  });
};

export const updateYyChannelPlugin = (data: YyChannelPluginForm) => {
  return request({
    url: '/yy/channelPlugin',
    method: 'put',
    data
  });
};

export const delYyChannelPlugin = (ids: string | number | Array<string | number>) => {
  return request({
    url: '/yy/channelPlugin/' + ids,
    method: 'delete'
  });
};
