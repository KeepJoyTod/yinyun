import { AppShell } from "@/components/app-shell";
import { StaffManager } from "@/components/staff-manager";
import { getStaffManagementData } from "@/server/staff";
import { requireCurrentSession } from "@/server/session";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const session = await requireCurrentSession();
  const data = await getStaffManagementData(session.brandId);

  return (
    <AppShell title="员工管理" activePath="/staff" user={session}>
      <StaffManager initialStaff={data.staff} stores={data.stores} source={data.source} />
    </AppShell>
  );
}
