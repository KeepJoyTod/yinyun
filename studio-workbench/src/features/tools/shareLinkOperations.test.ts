import { describe, expect, it } from 'vitest'
import {
  CLIENT_WEB_BASE_URL,
  DOUYIN_APP_ID,
  WECHAT_APP_ID,
  buildEntryPayload,
  getChannelCode,
  getEntryCode,
  getEntryTypeFromRouteName,
  getH5Path,
  getMiniappPage,
  validateEntryParams,
} from './shareLinkOperations'

describe('share link operation helpers', () => {
  it('keeps platform constants centralized for QR material generation', () => {
    expect(WECHAT_APP_ID).toBe('wx2a1a34748f56a6c6')
    expect(DOUYIN_APP_ID).toBe('tta3c8d5753dac3aae01')
    expect(CLIENT_WEB_BASE_URL).toBe('https://yingyueyun.evanshine.me')
  })

  it('maps entry and channel values to compact scene codes', () => {
    expect(getEntryCode('STORE')).toBe('ST')
    expect(getEntryCode('BOOKING')).toBe('BK')
    expect(getEntryCode('PICKUP')).toBe('PK')
    expect(getEntryCode('ORDER')).toBe('OD')

    expect(getChannelCode('STORE')).toBe('ST')
    expect(getChannelCode('WECHAT')).toBe('WX')
    expect(getChannelCode('DOUYIN')).toBe('DY')
    expect(getChannelCode('MEITUAN')).toBe('MT')
  })

  it('chooses the correct miniapp and H5 paths per entry type', () => {
    expect(getMiniappPage('PICKUP')).toBe('pages/pickup/login/index')
    expect(getMiniappPage('BOOKING')).toBe('pages/booking/entry/index')
    expect(getMiniappPage('ORDER')).toBe('pages/booking/entry/index')

    expect(getH5Path('PICKUP')).toBe('/customer/login')
    expect(getH5Path('ORDER')).toBe('/customer/order')
    expect(getH5Path('BOOKING')).toBe('/booking')
  })

  it('builds store-scoped miniapp path, scene, H5 fallback, and QR value', () => {
    expect(buildEntryPayload({
      storeId: '990202606080001',
      entryType: 'PICKUP',
      channel: 'WECHAT',
    })).toEqual({
      query: {
        storeId: '990202606080001',
        entry: 'PICKUP',
        channel: 'WECHAT',
      },
      queryString: 'storeId=990202606080001&entry=PICKUP&channel=WECHAT',
      scene: 's=990202606080001&e=PK&c=WX',
      miniappPage: 'pages/pickup/login/index',
      miniappPath: 'pages/pickup/login/index?storeId=990202606080001&entry=PICKUP&channel=WECHAT',
      h5Path: '/customer/login',
      h5Url: 'https://yingyueyun.evanshine.me/customer/login?storeId=990202606080001&entry=PICKUP&channel=WECHAT',
      qrValue: 'weapp://wx2a1a34748f56a6c6/pages/pickup/login/index?storeId=990202606080001&entry=PICKUP&channel=WECHAT',
    })
  })

  it('defaults tool routes to the right QR entry type', () => {
    expect(getEntryTypeFromRouteName('tool-booking-entry')).toBe('BOOKING')
    expect(getEntryTypeFromRouteName('tool-pickup-entry')).toBe('PICKUP')
    expect(getEntryTypeFromRouteName('tool-share-links')).toBe('STORE')
    expect(getEntryTypeFromRouteName(undefined)).toBe('STORE')
  })

  it('validates entry params and reports missing fields', () => {
    expect(validateEntryParams('123', 'STORE', 'WECHAT')).toEqual({ valid: true, missing: [] })
    expect(validateEntryParams('', 'STORE', 'WECHAT')).toEqual({ valid: false, missing: ['storeId（门店 ID）'] })
    expect(validateEntryParams('123', '', 'WECHAT')).toEqual({ valid: false, missing: ['entry（入口类型）'] })
    expect(validateEntryParams('123', 'STORE', '')).toEqual({ valid: false, missing: ['channel（渠道）'] })
    expect(validateEntryParams('', '', '')).toEqual({ valid: false, missing: ['storeId（门店 ID）', 'entry（入口类型）', 'channel（渠道）'] })
    expect(validateEntryParams('  ', 'STORE', 'WECHAT')).toEqual({ valid: false, missing: ['storeId（门店 ID）'] })
  })
})
