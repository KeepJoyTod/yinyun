import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { YyServiceGroupForm, YyServiceGroupQuery, YyServiceGroupVO } from './types';

export const listYyServiceGroup = (query?: YyServiceGroupQuery): AxiosPromise<YyServiceGroupVO[]> => {
  return request({
    url: '/yy/serviceGroup/list',
    method: 'get',
    params: query
  });
};

export const getYyServiceGroup = (id: string | number): AxiosPromise<YyServiceGroupVO> => {
  return request({
    url: '/yy/serviceGroup/' + id,
    method: 'get'
  });
};

export const addYyServiceGroup = (data: YyServiceGroupForm) => {
  return request({
    url: '/yy/serviceGroup',
    method: 'post',
    data
  });
};

export const updateYyServiceGroup = (data: YyServiceGroupForm) => {
  return request({
    url: '/yy/serviceGroup',
    method: 'put',
    data
  });
};

export const delYyServiceGroup = (ids: string | number | Array<string | number>) => {
  return request({
    url: '/yy/serviceGroup/' + ids,
    method: 'delete'
  });
};
