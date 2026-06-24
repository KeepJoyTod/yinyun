import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { YyScheduleRuleForm, YyScheduleRuleQuery, YyScheduleRuleVO } from './types';

export const listYyScheduleRule = (query?: YyScheduleRuleQuery): AxiosPromise<YyScheduleRuleVO[]> => {
  return request({
    url: '/yy/scheduleRule/list',
    method: 'get',
    params: query
  });
};

export const getYyScheduleRule = (id: string | number): AxiosPromise<YyScheduleRuleVO> => {
  return request({
    url: '/yy/scheduleRule/' + id,
    method: 'get'
  });
};

export const addYyScheduleRule = (data: YyScheduleRuleForm) => {
  return request({
    url: '/yy/scheduleRule',
    method: 'post',
    data
  });
};

export const updateYyScheduleRule = (data: YyScheduleRuleForm) => {
  return request({
    url: '/yy/scheduleRule',
    method: 'put',
    data
  });
};

export const delYyScheduleRule = (ids: string | number | Array<string | number>) => {
  return request({
    url: '/yy/scheduleRule/' + ids,
    method: 'delete'
  });
};
