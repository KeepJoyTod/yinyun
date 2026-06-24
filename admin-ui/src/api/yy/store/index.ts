import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { YyStoreForm, YyStoreQuery, YyStoreVO } from './types';

export const listYyStore = (query?: YyStoreQuery): AxiosPromise<YyStoreVO[]> => {
  return request({
    url: '/yy/store/list',
    method: 'get',
    params: query
  });
};

export const getYyStore = (id: string | number): AxiosPromise<YyStoreVO> => {
  return request({
    url: '/yy/store/' + id,
    method: 'get'
  });
};

export const addYyStore = (data: YyStoreForm) => {
  return request({
    url: '/yy/store',
    method: 'post',
    data
  });
};

export const updateYyStore = (data: YyStoreForm) => {
  return request({
    url: '/yy/store',
    method: 'put',
    data
  });
};

export const delYyStore = (ids: string | number | Array<string | number>) => {
  return request({
    url: '/yy/store/' + ids,
    method: 'delete'
  });
};
