import { AppShell } from "@/components/app-shell";
import { PhotoAlbumManager } from "@/components/photo-album-manager";
import { getPhotoAlbumManagementData } from "@/server/photo-albums";
import { requireCurrentSession } from "@/server/session";

export const dynamic = "force-dynamic";

export default async function PhotoAlbumsPage() {
  const session = await requireCurrentSession();
  const data = await getPhotoAlbumManagementData(session.brandId);

  return (
    <AppShell title="客片选片" activePath="/photo-albums" user={session}>
      <PhotoAlbumManager initialAlbums={data.albums} customers={data.customers} orders={data.orders} source={data.source} />
    </AppShell>
  );
}
