import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { YyNotificationTemplateForm, YyNotificationTemplateQuery, YyNotificationTemplateVO } from './types';

export const listYyNotificationTemplate = (query?: YyNotificationTemplateQuery): AxiosPromise<YyNotificationTemplateVO[]> => {
  return request({
    url: '/yy/notificationTemplate/list',
    method: 'get',
    params: query
  });
};

export const getYyNotificationTemplate = (id: string | number): AxiosPromise<YyNotificationTemplateVO> => {
  return request({
    url: '/yy/notificationTemplate/' + id,
    method: 'get'
  });
};

export const addYyNotificationTemplate = (data: YyNotificationTemplateForm) => {
  return request({
    url: '/yy/notificationTemplate',
    method: 'post',
    data
  });
};

export const updateYyNotificationTemplate = (data: YyNotificationTemplateForm) => {
  return request({
    url: '/yy/notificationTemplate',
    method: 'put',
    data
  });
};

export const delYyNotificationTemplate = (ids: string | number | Array<string | number>) => {
  return request({
    url: '/yy/notificationTemplate/' + ids,
    method: 'delete'
  });
};
