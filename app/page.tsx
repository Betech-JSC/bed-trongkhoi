import { weddingData } from '@/lib/weddingData';
import InvitationClient from './[slug]/InvitationClient';

export const dynamic = 'force-dynamic';

export default async function WelcomePage({
  searchParams,
}: {
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
