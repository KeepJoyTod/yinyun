import { AppShell } from "@/components/app-shell";
import { CustomerManager } from "@/components/customer-manager";
import { getCustomerManagementData } from "@/server/customers";
import { requireCurrentSession } from "@/server/session";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const session = await requireCurrentSession();
  const data = await getCustomerManagementData(session.brandId);

  return (
    <AppShell title="客户管理" activePath="/customers" user={session}>
      <div className="space-y-4">
        <div className="flex justify-end">
          <a className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm" href="/api/exports/customers">
            导出客户
          </a>
        </div>
        <CustomerManager initialCustomers={data.customers} source={data.source} />
      </div>
    </AppShell>
  );
}
