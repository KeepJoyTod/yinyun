import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { YyPhotoAccessLogQuery, YyPhotoAccessLogVO } from './types';

export const listYyPhotoAccessLog = (query?: YyPhotoAccessLogQuery): AxiosPromise<YyPhotoAccessLogVO[]> => {
  return request({
    url: '/yy/photoAccessLog/list',
    method: 'get',
    params: query
  });
};
