import { weddingData } from '@/lib/weddingData';
import InvitationClient from './InvitationClient';

export const dynamic = 'force-dynamic';

export default async function InvitationPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // Handle guest name personalization (e.g. ?to=Anh+Tuấn)
  let guestName = 'Quý Khách';
  if (searchParams && typeof searchParams.to === 'string') {
    guestName = searchParams.to;
  }

  return (
    <InvitationClient wedding={weddingData} guestName={guestName} />
  );
}
