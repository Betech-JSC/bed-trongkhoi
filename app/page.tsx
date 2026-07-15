import Link from 'next/link';
import { getLoggedInUser } from '@/lib/auth';

export default async function WelcomePage() {
  const user = await getLoggedInUser();

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 -z-10 w-96 h-96 bg-rose-100 rounded-full blur-3xl opacity-50" />

      <header className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-extrabold tracking-tight text-indigo-600">iWedding</span>
        </div>
        <nav className="flex items-center gap-4">
          {user ? (
            <Link
              href="/dashboard"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-100"
            >
              Vào Quản Trị
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-slate-600 hover:text-slate-900 text-sm font-semibold px-3 py-2 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-100"
              >
                Đăng ký
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-semibold text-indigo-700">Miễn phí & Dễ sử dụng</span>
          </div>

          <h1 className="text-5xl lg:text-6xl font-black text-slate-900 leading-tight">
            Thiệp Cưới Online <br />
            <span className="text-indigo-600 bg-gradient-to-r from-indigo-600 to-rose-500 bg-clip-text text-transparent">Chuyên Nghiệp</span> & Tinh Tế
          </h1>

          <p className="text-lg text-slate-500 leading-relaxed max-w-xl">
            Tạo tấm thiệp cưới online đẹp mắt chỉ trong 2 phút. Cá nhân hóa link gửi khách, nhận phản hồi RSVP xác nhận tham dự và chia sẻ khoảnh khắc hạnh phúc của bạn một cách trọn vẹn nhất.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              href={user ? "/dashboard" : "/login"}
              className="bg-slate-900 hover:bg-slate-800 text-white text-base font-bold px-8 py-4 rounded-2xl shadow-lg transition-all"
            >
              Tạo Thiệp Ngay
            </Link>
            <Link
              href="/KHOI&VAN"
              target="_blank"
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-base font-bold px-8 py-4 rounded-2xl transition-all flex items-center gap-2"
            >
              Xem Demo
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="relative">
          {/* Beautiful Mockup representation */}
          <div className="bg-gradient-to-br from-indigo-50 to-rose-50 p-6 rounded-3xl border border-slate-100 shadow-2xl relative overflow-hidden aspect-[4/3] flex items-center justify-center">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 max-w-sm text-center">
              <span className="text-xs font-semibold text-rose-500 uppercase tracking-widest block mb-2">Save the Date</span>
              <h3 className="text-2xl font-extrabold text-slate-800">Trọng Khôi & Thanh Vân</h3>
              <p className="text-sm text-slate-400 mt-1">Đám cưới sắp diễn ra vào ngày 01.08.2026</p>
              <div className="my-6 border-t border-b border-slate-100 py-3 grid grid-cols-3 gap-2">
                <div>
                  <span className="text-xs text-slate-400 block">Thời gian</span>
                  <span className="text-sm font-bold text-slate-700">17:30</span>
                </div>
                <div className="border-l border-r border-slate-100">
                  <span className="text-xs text-slate-400 block">Tháng</span>
                  <span className="text-sm font-bold text-slate-700">Thg 08</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Năm</span>
                  <span className="text-sm font-bold text-slate-700">2026</span>
                </div>
              </div>
              <div className="inline-block bg-rose-500 text-white font-bold text-xs px-4 py-2 rounded-full uppercase tracking-wider">
                Xác Nhận Tham Dự (RSVP)
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
