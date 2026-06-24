import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { YyChannelAccountForm, YyChannelAccountQuery, YyChannelAccountVO } from './types';

export const listYyChannelAccount = (query?: YyChannelAccountQuery): AxiosPromise<YyChannelAccountVO[]> => {
  return request({
    url: '/yy/channelAccount/list',
    method: 'get',
    params: query
  });
};

export const getYyChannelAccount = (id: string | number): AxiosPromise<YyChannelAccountVO> => {
  return request({
    url: '/yy/channelAccount/' + id,
    method: 'get'
  });
};

export const addYyChannelAccount = (data: YyChannelAccountForm) => {
  return request({
    url: '/yy/channelAccount',
    method: 'post',
    data
  });
};

export const updateYyChannelAccount = (data: YyChannelAccountForm) => {
  return request({
    url: '/yy/channelAccount',
    method: 'put',
    data
  });
};

export const delYyChannelAccount = (ids: string | number | Array<string | number>) => {
  return request({
    url: '/yy/channelAccount/' + ids,
    method: 'delete'
  });
};
