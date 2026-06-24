import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { YyChannelProductMappingForm, YyChannelProductMappingQuery, YyChannelProductMappingVO } from './types';

export const listYyChannelProductMapping = (query?: YyChannelProductMappingQuery): AxiosPromise<YyChannelProductMappingVO[]> => {
  return request({
    url: '/yy/channelProductMapping/list',
    method: 'get',
    params: query
  });
};

export const getYyChannelProductMapping = (id: string | number): AxiosPromise<YyChannelProductMappingVO> => {
  return request({
    url: '/yy/channelProductMapping/' + id,
    method: 'get'
  });
};

export const addYyChannelProductMapping = (data: YyChannelProductMappingForm) => {
  return request({
    url: '/yy/channelProductMapping',
    method: 'post',
    data
  });
};

export const updateYyChannelProductMapping = (data: YyChannelProductMappingForm) => {
  return request({
    url: '/yy/channelProductMapping',
    method: 'put',
    data
  });
};

export const delYyChannelProductMapping = (ids: string | number | Array<string | number>) => {
  return request({
    url: '/yy/channelProductMapping/' + ids,
    method: 'delete'
  });
};
