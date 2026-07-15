"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { registerAction } from '../actions/auth';

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm_password') as string;

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp.');
      setLoading(false);
      return;
    }

    try {
      const result = await registerAction(formData);
      if (result && result.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch (err: any) {
      setError('Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background circles */}
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 -z-10 w-96 h-96 bg-rose-100 rounded-full blur-3xl opacity-50" />

      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl relative">
        <div>
          <div className="text-center">
            <Link href="/" className="text-3xl font-extrabold tracking-tight text-indigo-600">
              iWedding
            </Link>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
            Tạo tài khoản mới
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Hoặc{' '}
            <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
              đăng nhập nếu đã có tài khoản
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 text-sm px-4 py-3 rounded-xl font-medium" role="alert">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
                Họ và Tên
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all"
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                Địa chỉ Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all"
                placeholder="ten@email.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-semibold text-slate-700">
                Xác nhận Mật khẩu
              </label>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                required
                className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-100 disabled:bg-slate-300 transition-all"
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký tài khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
