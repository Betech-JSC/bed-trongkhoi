"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createWeddingAction } from '../../actions/wedding';

export default function CreateWeddingPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await createWeddingAction(formData);
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
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Quay lại quản lý
            </Link>
          </div>
        </div>

        <div className="overflow-hidden bg-white shadow-sm sm:rounded-3xl border border-slate-100 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 leading-tight">
              Tạo Thiệp Cưới Mới
            </h2>
            <p className="text-sm text-slate-400 mt-1">Vui lòng điền các thông tin cơ bản ban đầu để bắt đầu khởi tạo thiệp cưới.</p>
          </div>

          {error && (
            <div className="mb-6 bg-rose-50 border border-rose-100 text-rose-600 text-sm px-4 py-3 rounded-xl font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* URL Slug */}
            <div>
              <label className="block text-sm font-semibold text-slate-700">Đường dẫn thiệp cưới (URL Slug) *</label>
              <div className="mt-1 flex rounded-xl shadow-sm">
                <span className="inline-flex items-center rounded-l-xl border border-r-0 border-slate-200 px-4 text-sm text-slate-400 bg-slate-50 font-medium">
                  {origin || 'http://localhost:3000'}/
                </span>
                <input
                  type="text"
                  name="slug"
                  required
                  placeholder="vi-du-trong-khoi-thanh-van"
                  className="block w-full flex-1 rounded-none rounded-r-xl border border-slate-200 px-4 py-3 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Định dạng chữ thường không dấu, nối với nhau bằng dấu gạch ngang (ví dụ: `khoi-van`).</p>
            </div>

            {/* Template selector */}
            <div>
              <label className="block text-sm font-semibold text-slate-700">Chọn mẫu giao diện *</label>
              <select
                name="template"
                defaultValue="RedWhite"
                className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all bg-white"
              >
                <option value="RedWhite">Red &amp; White (Tone màu Đỏ rượu &amp; Trắng sữa)</option>
                <option value="ClassicGold" disabled>Classic Gold (Tone màu Vàng kim - Sắp ra mắt)</option>
              </select>
            </div>

            {/* Names grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Groom Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">Họ và tên Chú Rể *</label>
                <input
                  type="text"
                  name="groom_name"
                  required
                  placeholder="Lê Hữu Quân"
                  className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all"
                />
              </div>

              {/* Groom Short Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">Tên gọi chú rể (hiển thị trang bìa)</label>
                <input
                  type="text"
                  name="groom_short_name"
                  placeholder="Hữu Quân"
                  className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Bride Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">Họ và tên Cô Dâu *</label>
                <input
                  type="text"
                  name="bride_name"
                  required
                  placeholder="Đỗ Thị Bắc"
                  className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all"
                />
              </div>

              {/* Bride Short Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">Tên gọi cô dâu (hiển thị trang bìa)</label>
                <input
                  type="text"
                  name="bride_short_name"
                  placeholder="Đỗ Bắc"
                  className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all"
                />
              </div>
            </div>

            {/* Wedding Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-700">Ngày cưới *</label>
              <input
                type="date"
                name="wedding_date"
                required
                className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
              <Link
                href="/dashboard"
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm px-6 py-3 rounded-xl transition-all"
              >
                Hủy bỏ
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-indigo-100 disabled:bg-slate-300 transition-all"
              >
                {loading ? 'Đang Khởi Tạo...' : 'Khởi Tạo Thiệp'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
