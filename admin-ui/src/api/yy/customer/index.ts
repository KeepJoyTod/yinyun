import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { YyOrderVO } from '../order/types';
import type { YyCustomerForm, YyCustomerQuery, YyCustomerVO } from './types';

export const listYyCustomer = (query?: YyCustomerQuery): AxiosPromise<YyCustomerVO[]> => {
  return request({
    url: '/yy/customer/list',
    method: 'get',
    params: query
  });
};

export const getYyCustomer = (id: string | number): AxiosPromise<YyCustomerVO> => {
  return request({
    url: '/yy/customer/' + id,
    method: 'get'
  });
};

export const addYyCustomer = (data: YyCustomerForm) => {
  return request({
    url: '/yy/customer',
    method: 'post',
    data
  });
};

export const updateYyCustomer = (data: YyCustomerForm) => {
  return request({
    url: '/yy/customer',
    method: 'put',
    data
  });
};

export const delYyCustomer = (ids: string | number | Array<string | number>) => {
  return request({
    url: '/yy/customer/' + ids,
    method: 'delete'
  });
};

export const listYyCustomerRecentOrders = (id: string | number, limit = 5): AxiosPromise<YyOrderVO[]> => {
  return request({
    url: `/yy/customer/${id}/orders`,
    method: 'get',
    params: { limit }
  });
};
