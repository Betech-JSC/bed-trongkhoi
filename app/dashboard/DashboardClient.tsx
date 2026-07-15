"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { deleteWeddingAction } from '../actions/wedding';

interface Wedding {
    id: number;
    slug: string;
    template: string;
    groom_name: string;
    bride_name: string;
    wedding_date: string;
    rsvp_responses_count: number;
}

interface Props {
    initialWeddings: Wedding[];
}

export default function DashboardClient({ initialWeddings }: Props) {
    const [weddings, setWeddings] = useState<Wedding[]>(initialWeddings);
    const [guestNameInputs, setGuestNameInputs] = useState<Record<number, string>>({});

    const handleDeleteWedding = async (slug: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa thiệp cưới này không? Toàn bộ phản hồi RSVP và ảnh liên quan sẽ bị xóa.')) {
            const res = await deleteWeddingAction(slug);
            if (res.success) {
                setWeddings(prev => prev.filter(w => w.slug !== slug));
                alert('Đã xóa thiệp cưới thành công!');
            } else if (res.error) {
                alert(res.error);
            }
        }
    };

    const handleCopyLink = (slug: string, id: number) => {
        const guestName = guestNameInputs[id] || '';
        const baseUrl = window.location.origin;
        const link = guestName
            ? `${baseUrl}/${slug}?to=${encodeURIComponent(guestName)}`
            : `${baseUrl}/${slug}`;

        navigator.clipboard.writeText(link);
        alert(`Đã copy link mời khách: ${link}`);
    };

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            {weddings.length === 0 ? (
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-2xl dark:bg-gray-800 p-12 text-center border border-slate-100 dark:border-slate-700">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">Chưa có thiệp cưới nào</h3>
                    <p className="mt-1 text-sm text-slate-400">Hãy bắt đầu tạo tấm thiệp cưới online đầu tiên cho khách hàng của bạn.</p>
                    <div className="mt-6">
                        <Link
                            href="/wedding/create"
                            className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-indigo-100 transition-colors"
                        >
                            Tạo Ngay
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {weddings.map((wedding) => (
                        <div
                            key={wedding.id}
                            className="bg-white dark:bg-gray-800 shadow-sm border border-slate-100 dark:border-slate-700 rounded-3xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-gray-100">
                                            {wedding.groom_name} &amp; {wedding.bride_name}
                                        </h3>
                                        <p className="text-xs text-indigo-600 mt-1 font-semibold">
                                            Đường dẫn: <a href={`/${wedding.slug}`} target="_blank" className="hover:underline">/{wedding.slug}</a>
                                        </p>
                                    </div>
                                    <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs px-3 py-1.5 rounded-full font-bold">
                                        Mẫu: {wedding.template}
                                    </span>
                                </div>

                                <div className="border-t border-b border-slate-100 dark:border-slate-700 py-3 my-4 grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-xs text-slate-400">Ngày cưới</span>
                                        <p className="font-bold text-slate-700 dark:text-gray-300 mt-0.5">{wedding.wedding_date}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-400">Khách mời phản hồi</span>
                                        <p className="font-bold text-slate-700 dark:text-gray-300 mt-0.5">{wedding.rsvp_responses_count} lượt RSVP</p>
                                    </div>
                                </div>

                                {/* Personalized Guest Link Generator */}
                                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl mb-6 border border-slate-100 dark:border-slate-800">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                        Tạo Link Cá Nhân Hóa (Gửi khách)
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Tên khách, ví dụ: Anh Tuấn..."
                                            value={guestNameInputs[wedding.id] || ''}
                                            onChange={e => setGuestNameInputs({
                                                ...guestNameInputs,
                                                [wedding.id]: e.target.value
                                            })}
                                            className="flex-1 text-sm border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 rounded-xl py-2 px-3 transition-colors"
                                        />
                                        <button
                                            onClick={() => handleCopyLink(wedding.slug, wedding.id)}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-100"
                                        >
                                            Copy Link
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-between items-center gap-3 pt-4 border-t border-slate-50 dark:border-slate-700">
                                <div className="flex gap-2">
                                    <Link
                                        href={`/${wedding.slug}/edit`}
                                        className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
                                    >
                                        Sửa cấu hình
                                    </Link>
                                    <Link
                                        href={`/${wedding.slug}/rsvps`}
                                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
                                    >
                                        Danh sách RSVP ({wedding.rsvp_responses_count})
                                    </Link>
                                </div>

                                <button
                                    onClick={() => handleDeleteWedding(wedding.slug)}
                                    className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 font-bold text-xs px-3 py-2 rounded-xl transition-all"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
