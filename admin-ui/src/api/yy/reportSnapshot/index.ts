import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { YyReportSnapshotForm, YyReportSnapshotQuery, YyReportSnapshotVO } from './types';

export const listYyReportSnapshot = (query?: YyReportSnapshotQuery): AxiosPromise<YyReportSnapshotVO[]> => {
  return request({
    url: '/yy/reportSnapshot/list',
    method: 'get',
    params: query
  });
};

export const getYyReportSnapshot = (id: string | number): AxiosPromise<YyReportSnapshotVO> => {
  return request({
    url: '/yy/reportSnapshot/' + id,
    method: 'get'
  });
};

export const addYyReportSnapshot = (data: YyReportSnapshotForm) => {
  return request({
    url: '/yy/reportSnapshot',
    method: 'post',
    data
  });
};

export const updateYyReportSnapshot = (data: YyReportSnapshotForm) => {
  return request({
    url: '/yy/reportSnapshot',
    method: 'put',
    data
  });
};

export const delYyReportSnapshot = (ids: string | number | Array<string | number>) => {
  return request({
    url: '/yy/reportSnapshot/' + ids,
    method: 'delete'
  });
};
