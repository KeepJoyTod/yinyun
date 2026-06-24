import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { YyNotificationLogQuery, YyNotificationLogVO } from './types';

export const listYyNotificationLog = (query?: YyNotificationLogQuery): AxiosPromise<YyNotificationLogVO[]> => {
  return request({
    url: '/yy/notificationLog/list',
    method: 'get',
    params: query
  });
};

export const getYyNotificationLog = (id: string | number): AxiosPromise<YyNotificationLogVO> => {
  return request({
    url: '/yy/notificationLog/' + id,
    method: 'get'
  });
};

export const delYyNotificationLog = (ids: string | number | Array<string | number>) => {
  return request({
    url: '/yy/notificationLog/' + ids,
    method: 'delete'
  });
};
