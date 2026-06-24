import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { YyDashboardOverviewVO } from './types';

export const getYyDashboardOverview = (): AxiosPromise<YyDashboardOverviewVO> => {
  return request({
    url: '/yy/dashboard/overview',
    method: 'get'
  });
};
