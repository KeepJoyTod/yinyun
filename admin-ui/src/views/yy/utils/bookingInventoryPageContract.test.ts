import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const inventoryPageSource = readFileSync(resolve(__dirname, '../booking-inventory/index.vue'), 'utf-8');

describe('booking inventory page contracts', () => {
  it('keeps slot inventory operations visible for store operators', () => {
    expect(inventoryPageSource).toContain('时段库存账本');
    expect(inventoryPageSource).toContain('库存冲突');
    expect(inventoryPageSource).toContain('占用率');
    expect(inventoryPageSource).toContain('只看冲突');
    expect(inventoryPageSource).toContain('调整容量');
    expect(inventoryPageSource).toContain('查看冲突订单');
  });

  it('uses the booking inventory backend API and export endpoint', () => {
    expect(inventoryPageSource).toContain("listYyBookingSlotInventory");
    expect(inventoryPageSource).toContain("updateYyBookingSlotInventory");
    expect(inventoryPageSource).toContain("proxy?.download('yy/bookingSlotInventory/export'");
    expect(inventoryPageSource).toContain("path: '/yy/order'");
    expect(inventoryPageSource).toContain("inventoryStatus: 'CONFLICT'");
  });
});
