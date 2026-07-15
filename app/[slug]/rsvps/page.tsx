import db from '@/lib/db';
import { getLoggedInUser } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { logoutAction } from '@/app/actions/auth';

export default async function RsvpListPage({ params }: { params: { slug: string } }) {
  const user = await getLoggedInUser();
  if (!user) return null; // Middleware will redirect to login

  const { slug } = params;
  const decodedSlug = decodeURIComponent(slug);
  const wedding = await db.wedding.findFirst({
    where: {
      OR: [
        { slug: slug },
        { slug: decodedSlug }
      ]
    },
    include: {
      rsvpResponses: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!wedding) {
    notFound();
  }

  if (wedding.userId !== user.id) {
    redirect('/dashboard');
  }

  const rsvps = wedding.rsvpResponses;
  const totalResponses = rsvps.length;
  const attendingCount = rsvps.filter(r => r.attendanceStatus === 'attending').length;
  const absentCount = rsvps.filter(r => r.attendanceStatus === 'absent').length;
  const undecidedCount = rsvps.filter(r => r.attendanceStatus === 'undecided').length;

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
            <Link href="/dashboard" className="text-slate-600 hover:text-indigo-600 font-semibold text-sm">
              Dashboard
            </Link>
            <span className="text-slate-200">/</span>
            <span className="text-slate-400 font-semibold text-sm">Danh sách RSVP</span>
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

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 leading-tight">
              Lời Chúc &amp; RSVP: {wedding.groomName} &amp; {wedding.brideName}
            </h2>
            <p className="text-sm text-slate-500 mt-1">Xem phản hồi tham dự và lời chúc từ quan khách gửi tới cặp đôi.</p>
          </div>
          <Link
            href="/dashboard"
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            Quay lại Dashboard
          </Link>
        </div>

        {/* Metrics/Stats Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng phản hồi</span>
            <p className="text-3xl font-black text-slate-800 mt-2">{totalResponses}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center">
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Tham dự cưới</span>
            <p className="text-3xl font-black text-emerald-600 mt-2">{attendingCount}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center">
            <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">Không tham dự</span>
            <p className="text-3xl font-black text-rose-600 mt-2">{absentCount}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Chưa chắc chắn</span>
            <p className="text-3xl font-black text-amber-600 mt-2">{undecidedCount}</p>
          </div>
        </div>

        {/* RSVP Response Table / Details list */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Chi tiết phản hồi của khách</h3>
          </div>

          {rsvps.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              Chưa nhận được phản hồi xác nhận tham dự nào từ khách mời.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-400 uppercase bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-bold">Khách Mời</th>
                    <th scope="col" className="px-6 py-4 font-bold">Quan Hệ</th>
                    <th scope="col" className="px-6 py-4 font-bold">Trạng Thái</th>
                    <th scope="col" className="px-6 py-4 font-bold">Lời Chúc Mừng</th>
                    <th scope="col" className="px-6 py-4 font-bold">Thời Gian Gửi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rsvps.map((rsvp) => (
                    <tr key={rsvp.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {rsvp.guestName}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-400">
                        {rsvp.relation === 'Chú Rể'
                          ? 'Bạn Chú Rể'
                          : rsvp.relation === 'Cô Dâu'
                          ? 'Bạn Cô Dâu'
                          : rsvp.relation || 'Khách mời'}
                      </td>
                      <td className="px-6 py-4">
                        {rsvp.attendanceStatus === 'attending' && (
                          <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-bold">
                            Có Tham Dự
                          </span>
                        )}
                        {rsvp.attendanceStatus === 'absent' && (
                          <span className="bg-rose-50 text-rose-700 text-xs px-2.5 py-1 rounded-full font-bold">
                            Vắng Mật
                          </span>
                        )}
                        {rsvp.attendanceStatus === 'undecided' && (
                          <span className="bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-full font-bold">
                            Chưa Rõ
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 italic max-w-xs truncate" title={rsvp.wishes || ''}>
                        {rsvp.wishes || 'Không gửi lời chúc'}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(rsvp.createdAt).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
