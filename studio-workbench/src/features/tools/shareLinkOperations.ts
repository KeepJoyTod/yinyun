export type EntryType = 'STORE' | 'BOOKING' | 'PICKUP' | 'ORDER'
export type ChannelHint = 'STORE' | 'WECHAT' | 'DOUYIN' | 'MEITUAN'

export const WECHAT_APP_ID = 'wx2a1a34748f56a6c6'
export const DOUYIN_APP_ID = 'tta3c8d5753dac3aae01'
export const CLIENT_WEB_BASE_URL = 'https://yingyueyun.evanshine.me'

export type EntryPayloadInput = {
  storeId: string
  entryType: EntryType
  channel: ChannelHint
}

export const getChannelCode = (channel: ChannelHint) => {
  const map: Record<ChannelHint, string> = {
    STORE: 'ST',
    WECHAT: 'WX',
    DOUYIN: 'DY',
    MEITUAN: 'MT',
  }
  return map[channel]
}

export const getEntryCode = (entryType: EntryType) => {
  const map: Record<EntryType, string> = {
    STORE: 'ST',
    BOOKING: 'BK',
    PICKUP: 'PK',
    ORDER: 'OD',
  }
  return map[entryType]
}

export const getMiniappPage = (entryType: EntryType) => {
  if (entryType === 'PICKUP') return 'pages/pickup/login/index'
  return 'pages/booking/entry/index'
}

export const getH5Path = (entryType: EntryType) => {
  if (entryType === 'PICKUP') return '/customer/login'
  if (entryType === 'ORDER') return '/customer/order'
  return '/booking'
}

export const buildEntryPayload = ({ storeId, entryType, channel }: EntryPayloadInput) => {
  const query = {
    storeId,
    entry: entryType,
    channel,
  }
  const queryString = new URLSearchParams(query).toString()
  const miniappPage = getMiniappPage(entryType)
  const h5Path = getH5Path(entryType)
  const miniappPath = `${miniappPage}?${queryString}`

  return {
    query,
    queryString,
    scene: `s=${storeId}&e=${getEntryCode(entryType)}&c=${getChannelCode(channel)}`,
    miniappPage,
    miniappPath,
    h5Path,
    h5Url: `${CLIENT_WEB_BASE_URL}${h5Path}?${queryString}`,
    qrValue: `weapp://${WECHAT_APP_ID}/${miniappPath}`,
  }
}

export const getEntryTypeFromRouteName = (routeName: unknown): EntryType => {
  if (routeName === 'tool-booking-entry') return 'BOOKING'
  if (routeName === 'tool-pickup-entry') return 'PICKUP'
  return 'STORE'
}

export type EntryParamValidation = {
  valid: boolean
  missing: string[]
}

export const validateEntryParams = (storeId: string, entry: string, channel: string): EntryParamValidation => {
  const missing: string[] = []
  if (!storeId?.trim()) missing.push('storeId（门店 ID）')
  if (!entry?.trim()) missing.push('entry（入口类型）')
  if (!channel?.trim()) missing.push('channel（渠道）')
  return { valid: missing.length === 0, missing }
}
