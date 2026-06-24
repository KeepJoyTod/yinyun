import { AppShell } from "@/components/app-shell";
import { ChannelPluginManager } from "@/components/channel-plugin-manager";
import { getChannelPluginBoardData } from "@/server/channel";
import { requireCurrentSession } from "@/server/session";

export const dynamic = "force-dynamic";

export default async function ChannelPluginsPage() {
  const session = await requireCurrentSession();
  const data = await getChannelPluginBoardData(session.brandId);

  return (
    <AppShell title="渠道插件" activePath="/channel-plugins" user={session}>
      <ChannelPluginManager data={data} />
    </AppShell>
  );
}
