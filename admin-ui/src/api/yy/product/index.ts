import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { YyProductForm, YyProductQuery, YyProductVO } from './types';

export const listYyProduct = (query?: YyProductQuery): AxiosPromise<YyProductVO[]> => {
  return request({
    url: '/yy/product/list',
    method: 'get',
    params: query
  });
};

export const getYyProduct = (id: string | number): AxiosPromise<YyProductVO> => {
  return request({
    url: '/yy/product/' + id,
    method: 'get'
  });
};

export const addYyProduct = (data: YyProductForm) => {
  return request({
    url: '/yy/product',
    method: 'post',
    data
  });
};

export const updateYyProduct = (data: YyProductForm) => {
  return request({
    url: '/yy/product',
    method: 'put',
    data
  });
};

export const delYyProduct = (ids: string | number | Array<string | number>) => {
  return request({
    url: '/yy/product/' + ids,
    method: 'delete'
  });
};
