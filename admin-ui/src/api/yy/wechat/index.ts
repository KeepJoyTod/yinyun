import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { YyWechatNoticeTestForm, YyWechatWorkbenchVO } from './types';

export const getYyWechatWorkbench = (): AxiosPromise<YyWechatWorkbenchVO> => {
  return request({
    url: '/yy/wechat/workbench',
    method: 'get'
  });
};

export const sendYyWechatTestNotice = (data: YyWechatNoticeTestForm): AxiosPromise<string> => {
  return request({
    url: '/yy/wechat/notice/test',
    method: 'post',
    data
  });
};
