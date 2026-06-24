import { describe, expect, it } from 'vitest'
import trendSource from './TrendChart.vue?raw'

describe('TrendChart contract', () => {
  it('renders with native SVG instead of shipping ECharts runtime', () => {
    expect(trendSource).toContain('<svg')
    expect(trendSource).toContain('<polyline')
    expect(trendSource).toContain('viewBox="0 0 640 260"')
    expect(trendSource).not.toContain('v-chart')
    expect(trendSource).not.toContain('vue-echarts')
    expect(trendSource).not.toContain('echarts/')
    expect(trendSource).not.toContain('autoresize')
  })

  it('draws two native trend series for booked and arrived counts', () => {
    expect(trendSource).toContain('预约')
    expect(trendSource).toContain('到店')
    expect(trendSource).toContain('bookedCount')
    expect(trendSource).toContain('arrivedCount')
    expect(trendSource).toContain('bookedPoints')
    expect(trendSource).toContain('arrivedPoints')
  })

  it('uses amber theme colors and an empty state for chart styling', () => {
    expect(trendSource).toContain('#B8543B')
    expect(trendSource).toContain('#FBF8F2')
    expect(trendSource).toContain('#1A1814')
    expect(trendSource).toContain('暂无趋势数据')
  })

  it('renders in a fixed height container', () => {
    expect(trendSource).toContain('h-[300px]')
  })
})
