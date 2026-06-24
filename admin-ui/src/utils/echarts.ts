import { BarChart, GaugeChart, LineChart, PieChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import { init, use, type EChartsType } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';

use([BarChart, GaugeChart, GridComponent, LegendComponent, LineChart, PieChart, TooltipComponent, CanvasRenderer]);

export { init };
export type { EChartsType };
