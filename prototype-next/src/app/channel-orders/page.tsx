import { AppShell } from "@/components/app-shell";
import { ChannelOrderManager } from "@/components/channel-order-manager";
import { getDouyinOrderBoardData, getDouyinOrderDetailData } from "@/server/channel";
import { requireCurrentSession } from "@/server/session";

export const dynamic = "force-dynamic";

export default async function ChannelOrdersPage() {
  const session = await requireCurrentSession();
  const data = await getDouyinOrderBoardData(session.brandId);
  const detail = data.orders[0] ? await getDouyinOrderDetailData(session.brandId, data.orders[0].externalOrderId) : null;

  return (
    <AppShell title="抖音订单" activePath="/channel-orders" user={session}>
      <ChannelOrderManager data={data} detail={detail} />
    </AppShell>
  );
}
