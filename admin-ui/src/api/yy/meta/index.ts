import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { EnterpriseModuleVO, PriorityFeatureVO } from './types';

export const listPriorityFeatures = (): AxiosPromise<PriorityFeatureVO[]> => {
  return request({
    url: '/yy/meta/priority-features',
    method: 'get'
  });
};

export const listEnterpriseModules = (): AxiosPromise<EnterpriseModuleVO[]> => {
  return request({
    url: '/yy/meta/enterprise-modules',
    method: 'get'
  });
};
