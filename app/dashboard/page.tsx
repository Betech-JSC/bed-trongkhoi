import db from '@/lib/db';
import { getLoggedInUser } from '@/lib/auth';
import { logoutAction } from '../actions/auth';
import Link from 'next/link';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const user = await getLoggedInUser();
  if (!user) return null; // Middleware handles redirect to login

  const weddings = await db.wedding.findMany({
    where: { userId: user.id },
    include: {
      _count: {
        select: { rsvpResponses: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const mappedWeddings = weddings.map(w => ({
    id: w.id,
    slug: w.slug,
    template: w.template,
    groom_name: w.groomName,
    bride_name: w.brideName,
    wedding_date: w.weddingDate,
    rsvp_responses_count: w._count.rsvpResponses
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl font-extrabold tracking-tight text-indigo-600">
              iWedding
            </Link>
            <span className="text-slate-200">|</span>
            <span className="text-slate-600 font-semibold text-sm">Dashboard</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800">{user.name}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
            
            <form action={logoutAction}>
              <button
                type="submit"
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl transition-all"
              >
                Đăng xuất
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 leading-tight">
            Quản Lý Thiệp Cưới
          </h2>
          <p className="text-sm text-slate-500 mt-1">Quản lý và tạo thiệp cưới kỹ thuật số cho khách hàng.</p>
        </div>
        <Link
          href="/wedding/create"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-md shadow-indigo-100 transition-colors"
        >
          + Tạo Thiệp Mới
        </Link>
      </div>

      <main>
        <DashboardClient initialWeddings={mappedWeddings} />
      </main>
    </div>
  );
}
