export type MapProvider = 'manual' | 'mock' | 'amap' | 'tencent' | 'baidu'

export type MapLocationValue = {
  address: string
  lat: string
  lng: string
  adCode?: string
  provider: MapProvider
}

export type MapAdapterStatus = {
  provider: MapProvider
  enabled: boolean
  hasKey: boolean
  modeLabel: string
  helperText: string
}

const mapEnv = {
  VITE_AMAP_KEY: import.meta.env.VITE_AMAP_KEY,
  VITE_TENCENT_MAP_KEY: import.meta.env.VITE_TENCENT_MAP_KEY,
  VITE_BAIDU_MAP_KEY: import.meta.env.VITE_BAIDU_MAP_KEY,
} as const

const readEnv = (key: keyof typeof mapEnv) => {
  return String(mapEnv[key] || '').trim()
}

export const resolveMapAdapterStatus = (): MapAdapterStatus => {
  const amapKey = readEnv('VITE_AMAP_KEY')
  const tencentKey = readEnv('VITE_TENCENT_MAP_KEY')
  const baiduKey = readEnv('VITE_BAIDU_MAP_KEY')

  if (amapKey) {
    return {
      provider: 'amap',
      enabled: true,
      hasKey: true,
      modeLabel: '高德选点',
      helperText: '已检测到地图 Key，可先用模拟选点回填地址与经纬度，后续可切真实 SDK。',
    }
  }
  if (tencentKey) {
    return {
      provider: 'tencent',
      enabled: true,
      hasKey: true,
      modeLabel: '腾讯选点',
      helperText: '已检测到地图 Key，可先用模拟选点回填地址与经纬度，后续可切真实 SDK。',
    }
  }
  if (baiduKey) {
    return {
      provider: 'baidu',
      enabled: true,
      hasKey: true,
      modeLabel: '百度选点',
      helperText: '已检测到地图 Key，可先用模拟选点回填地址与经纬度，后续可切真实 SDK。',
    }
  }

  return {
    provider: 'manual',
    enabled: false,
    hasKey: false,
    modeLabel: '手动经纬度',
    helperText: '当前未配置地图 Key，系统将退化为地址与经纬度手输模式，不影响门店保存。',
  }
}

export const buildMockMapLocation = (seedText: string, current?: Partial<MapLocationValue>): MapLocationValue => {
  const text = seedText.trim() || current?.address?.trim() || '门店地址'
  const seed = Array.from(text).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const lat = (30 + (seed % 9000) / 1000).toFixed(6)
  const lng = (100 + (seed % 7000) / 1000).toFixed(6)
  return {
    address: text,
    lat,
    lng,
    adCode: String(310000 + (seed % 1000)),
    provider: current?.provider && current.provider !== 'manual' ? current.provider : 'mock',
  }
}
