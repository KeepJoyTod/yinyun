export type Metric = {
  label: string;
  value: string;
  delta?: string;
  tone?: "neutral" | "success" | "warning";
};

export type ListItem = {
  title: string;
  subtitle: string;
  status: string;
  meta: string;
};

export const metrics: Metric[] = [
  { label: "今日预约", value: "12", delta: "+3", tone: "success" },
  { label: "待确认", value: "5", delta: "+1", tone: "warning" },
  { label: "进行中", value: "2", delta: "0", tone: "neutral" },
  { label: "预计收入", value: "¥18,600", delta: "+12%", tone: "success" }
];

export const dashboardOrders: ListItem[] = [
  { title: "文瑞 / 威海智慧谷店", subtitle: "团购预约-定金20到店退", status: "待确认", meta: "10:00 · 证件照" },
  { title: "范恒宇 / 滨州万达店", subtitle: "冲印产品", status: "待服务", meta: "10:30 · 13 张" },
  { title: "宫雪艳 / 威海智慧谷店", subtitle: "附加产品", status: "服务中", meta: "11:00 · 加急修图" }
];

export const stores = [
  { name: "威海智慧谷店", status: "正常", staff: 7, slots: "28/30", phone: "16620013461" },
  { name: "滨州万达店", status: "正常", staff: 5, slots: "20/24", phone: "16620013462" },
  { name: "淄博万象汇店", status: "维护中", staff: 3, slots: "8/16", phone: "16620013463" }
];

export const serviceGroups = [
  { name: "证件照预约", slotMinutes: 30, capacity: 2, enabled: true },
  { name: "写真拍摄", slotMinutes: 60, capacity: 1, enabled: true },
  { name: "冲印取件", slotMinutes: 15, capacity: 3, enabled: false }
];

export const products = [
  { name: "团购预约-定金20到店退", type: "团单产品", price: "¥20", enabled: true },
  { name: "现场预约通道", type: "服务产品", price: "¥0", enabled: true },
  { name: "VIP客户预约通道", type: "附加产品", price: "¥99", enabled: true }
];

export const orderRows = [
  { no: "YY20260531001", customer: "文瑞", phone: "178****6867", status: "待确认", amount: "¥20" },
  { no: "YY20260531002", customer: "范恒宇", phone: "138****7311", status: "待服务", amount: "¥88" },
  { no: "YY20260531003", customer: "宫雪艳", phone: "130****9625", status: "已完成", amount: "¥120" }
];

export const bookingSlots = [
  { time: "10:00", capacity: 2, used: 0 },
  { time: "10:30", capacity: 2, used: 1 },
  { time: "11:00", capacity: 2, used: 2 },
  { time: "11:30", capacity: 2, used: 1 }
];
