import db from '@/lib/db';
import { notFound } from 'next/navigation';
import InvitationClient from './InvitationClient';

export const dynamic = 'force-dynamic';

export default async function InvitationPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const { slug } = params;
  const decodedSlug = decodeURIComponent(slug);

  let wedding = null;
  try {
    wedding = await db.wedding.findFirst({
      where: {
        OR: [
          { slug: slug },
          { slug: decodedSlug }
        ]
      }
    });
  } catch (error) {
    console.error('Error fetching wedding from database:', error);
  }

  if (!wedding) {
    notFound();
  }

  // Serialize Prisma Date objects to string to avoid Next.js client component serialization error
  const serializedWedding = JSON.parse(JSON.stringify(wedding));

  // Handle guest name personalization (e.g. ?to=Anh+Tuấn)
  let guestName = 'Quý Khách';
  if (searchParams && typeof searchParams.to === 'string') {
    guestName = searchParams.to;
  }

  return (
    <InvitationClient wedding={serializedWedding} guestName={guestName} />
  );
}
