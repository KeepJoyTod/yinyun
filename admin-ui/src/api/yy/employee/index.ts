import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { YyEmployeeForm, YyEmployeeQuery, YyEmployeeVO } from './types';

export const listYyEmployee = (query?: YyEmployeeQuery): AxiosPromise<YyEmployeeVO[]> => {
  return request({
    url: '/yy/employee/list',
    method: 'get',
    params: query
  });
};

export const getYyEmployee = (id: string | number): AxiosPromise<YyEmployeeVO> => {
  return request({
    url: '/yy/employee/' + id,
    method: 'get'
  });
};

export const addYyEmployee = (data: YyEmployeeForm) => {
  return request({
    url: '/yy/employee',
    method: 'post',
    data
  });
};

export const updateYyEmployee = (data: YyEmployeeForm) => {
  return request({
    url: '/yy/employee',
    method: 'put',
    data
  });
};

export const delYyEmployee = (ids: string | number | Array<string | number>) => {
  return request({
    url: '/yy/employee/' + ids,
    method: 'delete'
  });
};
