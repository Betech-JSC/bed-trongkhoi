import db from '@/lib/db';
import { getLoggedInUser } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { logoutAction } from '@/app/actions/auth';
import EditClient from './EditClient';

export default async function EditWeddingPage({ params }: { params: { slug: string } }) {
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
    }
  });

  if (!wedding) {
    notFound();
  }

  if (wedding.userId !== user.id) {
    redirect('/dashboard');
  }

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
            <span className="text-slate-400 font-semibold text-sm">Chỉnh sửa</span>
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

      <main>
        <EditClient wedding={wedding} />
      </main>
    </div>
  );
}
