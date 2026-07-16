import db from '@/lib/db';
import InvitationClient from './[slug]/InvitationClient';

export default async function WelcomePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // Get the first wedding record (since it's a single invitation website now)
  const wedding = await db.wedding.findFirst();

  if (!wedding) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-md text-center">
          <span className="text-4xl block mb-4">💍</span>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Chưa có thông tin tiệc cưới</h2>
          <p className="text-slate-500 mb-6">Vui lòng chạy seed database để nhập thông tin mẫu cho thiệp cưới của bạn.</p>
          <div className="bg-slate-50 p-4 rounded-2xl text-left border border-slate-100 font-mono text-sm text-slate-600 space-y-2">
            <p className="font-semibold text-xs text-slate-400 uppercase tracking-wider mb-1">Hướng dẫn nhanh:</p>
            <p className="text-xs">1. Mở Terminal / PowerShell</p>
            <p className="text-xs">2. Chạy lệnh:</p>
            <code className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded block mt-1 font-bold">
              npx prisma db seed
            </code>
          </div>
        </div>
      </div>
    );
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
