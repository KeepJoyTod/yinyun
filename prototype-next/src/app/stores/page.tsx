import { AppShell } from "@/components/app-shell";
import { StoreManager } from "@/components/store-manager";
import { getStoreManagementData } from "@/server/stores";
import { requireCurrentSession } from "@/server/session";

export const dynamic = "force-dynamic";

export default async function StoresPage() {
  const session = await requireCurrentSession();
  const data = await getStoreManagementData(session.brandId);

  return (
    <AppShell title="门店管理" activePath="/stores" user={session}>
      <StoreManager initialStores={data.stores} source={data.source} />
    </AppShell>
  );
}
