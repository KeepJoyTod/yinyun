import { AppShell } from "@/components/app-shell";
import { ProductManager } from "@/components/product-manager";
import { getProductManagementData } from "@/server/backoffice";
import { requireCurrentSession } from "@/server/session";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const session = await requireCurrentSession();
  const data = await getProductManagementData(session.brandId);

  return (
    <AppShell title="商品管理" activePath="/products" user={session}>
      <ProductManager initialProducts={data.products} serviceGroups={data.serviceGroups} source={data.source} />
    </AppShell>
  );
}
