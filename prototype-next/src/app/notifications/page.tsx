import { AppShell } from "@/components/app-shell";
import { NotificationManager } from "@/components/notification-manager";
import { getNotificationManagementData } from "@/server/notifications";
import { requireCurrentSession } from "@/server/session";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const session = await requireCurrentSession();
  const data = await getNotificationManagementData(session.brandId);

  return (
    <AppShell title="通知预留" activePath="/notifications" user={session}>
      <NotificationManager initialTemplates={data.templates} initialLogs={data.logs} source={data.source} />
    </AppShell>
  );
}
