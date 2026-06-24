import { notFound } from "next/navigation";
import { PublicPhotoSelection } from "@/components/public-photo-selection";
import { getPublicPhotoAlbum } from "@/server/photo-albums";

export const dynamic = "force-dynamic";

export default async function PublicPhotoAlbumPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const album = await getPublicPhotoAlbum(token);

  if (!album) {
    notFound();
  }

  return <PublicPhotoSelection initialAlbum={album} />;
}
