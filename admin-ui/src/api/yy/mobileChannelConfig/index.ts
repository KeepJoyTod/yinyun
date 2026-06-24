import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { YyMobileChannelConfigForm, YyMobileChannelConfigQuery, YyMobileChannelConfigVO } from './types';

export const listYyMobileChannelConfig = (query?: YyMobileChannelConfigQuery): AxiosPromise<YyMobileChannelConfigVO[]> => {
  return request({
    url: '/yy/mobileChannelConfig/list',
    method: 'get',
    params: query
  });
};

export const getYyMobileChannelConfig = (id: string | number): AxiosPromise<YyMobileChannelConfigVO> => {
  return request({
    url: '/yy/mobileChannelConfig/' + id,
    method: 'get'
  });
};

export const addYyMobileChannelConfig = (data: YyMobileChannelConfigForm) => {
  return request({
    url: '/yy/mobileChannelConfig',
    method: 'post',
    data
  });
};

export const updateYyMobileChannelConfig = (data: YyMobileChannelConfigForm) => {
  return request({
    url: '/yy/mobileChannelConfig',
    method: 'put',
    data
  });
};

export const delYyMobileChannelConfig = (ids: string | number | Array<string | number>) => {
  return request({
    url: '/yy/mobileChannelConfig/' + ids,
    method: 'delete'
  });
};
