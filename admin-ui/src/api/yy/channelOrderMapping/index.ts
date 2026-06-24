import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { YyChannelOrderMappingForm, YyChannelOrderMappingQuery, YyChannelOrderMappingVO } from './types';

export const listYyChannelOrderMapping = (query?: YyChannelOrderMappingQuery): AxiosPromise<YyChannelOrderMappingVO[]> => {
  return request({
    url: '/yy/channelOrderMapping/list',
    method: 'get',
    params: query
  });
};

export const getYyChannelOrderMapping = (id: string | number): AxiosPromise<YyChannelOrderMappingVO> => {
  return request({
    url: '/yy/channelOrderMapping/' + id,
    method: 'get'
  });
};

export const addYyChannelOrderMapping = (data: YyChannelOrderMappingForm) => {
  return request({
    url: '/yy/channelOrderMapping',
    method: 'post',
    data
  });
};

export const updateYyChannelOrderMapping = (data: YyChannelOrderMappingForm) => {
  return request({
    url: '/yy/channelOrderMapping',
    method: 'put',
    data
  });
};

export const delYyChannelOrderMapping = (ids: string | number | Array<string | number>) => {
  return request({
    url: '/yy/channelOrderMapping/' + ids,
    method: 'delete'
  });
};
