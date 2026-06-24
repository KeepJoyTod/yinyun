import { AppShell } from "@/components/app-shell";
import { OrderManager } from "@/components/order-manager";
import { getOrderManagementData } from "@/server/backoffice";
import { requireCurrentSession } from "@/server/session";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await requireCurrentSession();
  const data = await getOrderManagementData(session.brandId);

  return (
    <AppShell title="订单管理" activePath="/orders" user={session}>
      <div className="space-y-4">
        <div className="flex justify-end">
          <a className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm" href="/api/exports/orders">
            导出订单
          </a>
        </div>
        <OrderManager initialOrders={data.orders} staffOptions={data.staff} />
      </div>
    </AppShell>
  );
}
