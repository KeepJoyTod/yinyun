import { AppShell } from "@/components/app-shell";
import { ServiceGroupManager } from "@/components/service-group-manager";
import { getServiceGroupManagementData } from "@/server/backoffice";
import { requireCurrentSession } from "@/server/session";

export const dynamic = "force-dynamic";

export default async function ServiceGroupsPage() {
  const session = await requireCurrentSession();
  const data = await getServiceGroupManagementData(session.brandId);

  return (
    <AppShell title="服务组管理" activePath="/service-groups" user={session}>
      <ServiceGroupManager initialGroups={data.groups} stores={data.stores} source={data.source} />
    </AppShell>
  );
}
