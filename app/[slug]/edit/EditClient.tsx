"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { updateWeddingAction } from '../../actions/wedding';

interface Wedding {
  id: number;
  slug: string;
  template: string;
  groomName: string;
  groomShortName?: string | null;
  groomFather?: string | null;
  groomMother?: string | null;
  groomAddress?: string | null;
  brideName: string;
  brideShortName?: string | null;
  brideFather?: string | null;
  brideMother?: string | null;
  brideAddress?: string | null;
  weddingDate: string;
  ceremonyTitle: string;
  ceremonyTime?: string | null;
  ceremonyLocation?: string | null;
  ceremonyMapIframe?: string | null;
  ceremonyMapLink?: string | null;
  partyTitle: string;
  partyTime?: string | null;
  partyLocation?: string | null;
  partyMapIframe?: string | null;
  partyMapLink?: string | null;
  musicUrl?: string | null;
  albumPhotos: string; // JSON string
  activeSections: string; // JSON string
  bankName?: string | null;
  bankAccount?: string | null;
  bankHolderName?: string | null;
}

interface Props {
  wedding: Wedding;
}

export default function EditClient({ wedding }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'info' | 'events' | 'media' | 'settings'>('info');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states matching DB fields
  const [slug, setSlug] = useState(wedding.slug);
  const [template, setTemplate] = useState(wedding.template);
  const [weddingDate, setWeddingDate] = useState(wedding.weddingDate);

  const [groomName, setGroomName] = useState(wedding.groomName);
  const [groomShortName, setGroomShortName] = useState(wedding.groomShortName || '');
  const [groomFather, setGroomFather] = useState(wedding.groomFather || '');
  const [groomMother, setGroomMother] = useState(wedding.groomMother || '');
  const [groomAddress, setGroomAddress] = useState(wedding.groomAddress || '');

  const [brideName, setBrideName] = useState(wedding.brideName);
  const [brideShortName, setBrideShortName] = useState(wedding.brideShortName || '');
  const [brideFather, setBrideFather] = useState(wedding.brideFather || '');
  const [brideMother, setBrideMother] = useState(wedding.brideMother || '');
  const [brideAddress, setBrideAddress] = useState(wedding.brideAddress || '');

  const [ceremonyTitle, setCeremonyTitle] = useState(wedding.ceremonyTitle);
  const [ceremonyTime, setCeremonyTime] = useState(wedding.ceremonyTime || '');
  const [ceremonyLocation, setCeremonyLocation] = useState(wedding.ceremonyLocation || '');
  const [ceremonyMapIframe, setCeremonyMapIframe] = useState(wedding.ceremonyMapIframe || '');
  const [ceremonyMapLink, setCeremonyMapLink] = useState(wedding.ceremonyMapLink || '');

  const [partyTitle, setPartyTitle] = useState(wedding.partyTitle);
  const [partyTime, setPartyTime] = useState(wedding.partyTime || '');
  const [partyLocation, setPartyLocation] = useState(wedding.partyLocation || '');
  const [partyMapIframe, setPartyMapIframe] = useState(wedding.partyMapIframe || '');
  const [partyMapLink, setPartyMapLink] = useState(wedding.partyMapLink || '');

  const [musicUrl, setMusicUrl] = useState(wedding.musicUrl || '');
  const [photosList, setPhotosList] = useState<string[]>(JSON.parse(wedding.albumPhotos || '[]'));
  
  const parsedSections = JSON.parse(wedding.activeSections || '{}');
  const [activeSections, setActiveSections] = useState<Record<string, boolean>>({
    music: true,
    calendar: true,
    maps: true,
    rsvp: true,
    gallery: true,
    gift: true,
    ...parsedSections
  });

  const [bankName, setBankName] = useState(wedding.bankName || '');
  const [bankAccount, setBankAccount] = useState(wedding.bankAccount || '');
  const [bankHolderName, setBankHolderName] = useState(wedding.bankHolderName || '');

  const [error, setError] = useState<string | null>(null);

  const handleSectionToggle = (key: string) => {
    setActiveSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await fetch(`/api/wedding/${encodeURIComponent(wedding.slug)}/upload-photo`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setPhotosList(prev => [...prev, data.url]);
        alert('Đã tải ảnh lên album cưới thành công!');
      } else {
        alert(data.message || 'Lỗi upload ảnh.');
      }
    } catch (err: any) {
      alert('Có lỗi xảy ra khi upload ảnh.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = (urlToDelete: string) => {
    setPhotosList(prev => prev.filter(url => url !== urlToDelete));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const updateData = {
      slug,
      template,
      weddingDate,
      groomName,
      groomShortName,
      groomFather,
      groomMother,
      groomAddress,
      brideName,
      brideShortName,
      brideFather,
      brideMother,
      brideAddress,
      ceremonyTitle,
      ceremonyTime,
      ceremonyLocation,
      ceremonyMapIframe,
      ceremonyMapLink,
      partyTitle,
      partyTime,
      partyLocation,
      partyMapIframe,
      partyMapLink,
      musicUrl,
      albumPhotos: photosList,
      activeSections,
      bankName,
      bankAccount,
      bankHolderName
    };

    try {
      const result = await updateWeddingAction(wedding.slug, updateData);
      if (result && result.error) {
        setError(result.error);
        setLoading(false);
      } else {
        alert('Đã lưu cấu hình thành công!');
        setLoading(false);
        if (slug !== wedding.slug) {
          router.push(`/${slug}/edit`);
        }
      }
    } catch (err: any) {
      setError('Đã xảy ra lỗi hệ thống.');
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Header Info */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 leading-tight">
            Cấu Hình Thiệp: {wedding.groomName} &amp; {wedding.brideName}
          </h2>
          <p className="text-xs text-indigo-600 mt-1 font-semibold">
            Đường dẫn hiện tại: <a href={`/${wedding.slug}`} target="_blank" className="hover:underline">/{wedding.slug} ↗</a>
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/${wedding.slug}`}
            target="_blank"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-emerald-100 transition-colors flex items-center gap-1.5"
          >
            Xem Trang Live ↗
          </a>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-100 text-rose-600 text-sm px-4 py-3 rounded-xl font-semibold">
          {error}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap border border-slate-100 dark:border-gray-700 mb-6 bg-white dark:bg-gray-800 rounded-2xl p-1 shadow-sm gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('info')}
          className={`flex-1 min-w-[120px] text-center py-2.5 text-xs font-bold rounded-xl transition-all ${activeTab === 'info'
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
              : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          Dâu Rể &amp; Gia Đình
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('events')}
          className={`flex-1 min-w-[120px] text-center py-2.5 text-xs font-bold rounded-xl transition-all ${activeTab === 'events'
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
              : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          Sự Kiện &amp; Bản Đồ
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('media')}
          className={`flex-1 min-w-[120px] text-center py-2.5 text-xs font-bold rounded-xl transition-all ${activeTab === 'media'
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
              : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          Ảnh Album &amp; Nhạc Nền
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex-1 min-w-[120px] text-center py-2.5 text-xs font-bold rounded-xl transition-all ${activeTab === 'settings'
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
              : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          Bật Tắt Sections &amp; Mừng Cưới
        </button>
      </div>

      {/* Main Form */}
      <form onSubmit={handleFormSubmit} className="space-y-6">

        {/* Tab 1: Info */}
        {activeTab === 'info' && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
            <h3 className="text-sm font-bold text-slate-800 border-b pb-3 border-slate-100 uppercase tracking-wider">Cấu Hình Chung &amp; Thông Tin Gia Đình</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">Slug URL (Đường dẫn)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  className="mt-1 block w-full text-sm border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl py-2 px-3"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">Mẫu Giao Diện</label>
                <select
                  value={template}
                  onChange={e => setTemplate(e.target.value)}
                  className="mt-1 block w-full text-sm border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl py-2 px-3 bg-white"
                >
                  <option value="RedWhite">Red &amp; White</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">Ngày cưới</label>
                <input
                  type="date"
                  value={weddingDate}
                  onChange={e => setWeddingDate(e.target.value)}
                  className="mt-1 block w-full text-sm border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl py-2 px-3"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              {/* Groom side */}
              <div className="space-y-4 pr-0 md:pr-4 md:border-r border-slate-100">
                <p className="font-bold text-indigo-600 text-sm tracking-wide">THÔNG TIN CHÚ RỂ</p>
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Họ và tên Chú Rể *</label>
                  <input type="text" value={groomName} onChange={e => setGroomName(e.target.value)} className="mt-1 block w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Tên gọi ngắn (Trang bìa)</label>
                  <input type="text" value={groomShortName} onChange={e => setGroomShortName(e.target.value)} className="mt-1 block w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Họ tên Cha chú rể</label>
                  <input type="text" value={groomFather} onChange={e => setGroomFather(e.target.value)} className="mt-1 block w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Họ tên Mẹ chú rể</label>
                  <input type="text" value={groomMother} onChange={e => setGroomMother(e.target.value)} className="mt-1 block w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Địa chỉ tư gia nhà trai</label>
                  <input type="text" value={groomAddress} onChange={e => setGroomAddress(e.target.value)} className="mt-1 block w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" />
                </div>
              </div>

              {/* Bride side */}
              <div className="space-y-4">
                <p className="font-bold text-rose-500 text-sm tracking-wide">THÔNG TIN CÔ DÂU</p>
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Họ và tên Cô Dâu *</label>
                  <input type="text" value={brideName} onChange={e => setBrideName(e.target.value)} className="mt-1 block w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Tên gọi ngắn (Trang bìa)</label>
                  <input type="text" value={brideShortName} onChange={e => setBrideShortName(e.target.value)} className="mt-1 block w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Họ tên Cha cô dâu</label>
                  <input type="text" value={brideFather} onChange={e => setBrideFather(e.target.value)} className="mt-1 block w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Họ tên Mẹ cô dâu</label>
                  <input type="text" value={brideMother} onChange={e => setBrideMother(e.target.value)} className="mt-1 block w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Địa chỉ tư gia nhà gái</label>
                  <input type="text" value={brideAddress} onChange={e => setBrideAddress(e.target.value)} className="mt-1 block w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Events */}
        {activeTab === 'events' && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-8">

            {/* Ceremony Event */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-rose-600 border-b pb-2 border-slate-100 uppercase tracking-wide">SỰ KIỆN 1: HÔN LỄ CHÍNH (TÂN HÔN / VU QUY)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs text-slate-500">Tiêu đề lễ (ví dụ: LỄ VU QUY, LỄ TÂN HÔN)</label>
                  <input type="text" value={ceremonyTitle} onChange={e => setCeremonyTitle(e.target.value)} className="mt-1 block w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-xs text-slate-500">Giờ cử hành</label>
                  <input type="text" placeholder="11:00 - Thứ Tư 16.09.2026" value={ceremonyTime} onChange={e => setCeremonyTime(e.target.value)} className="mt-1 block w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500">Link chỉ đường (Google Maps URL)</label>
                  <input type="text" placeholder="https://maps.app.goo.gl/..." value={ceremonyMapLink} onChange={e => setCeremonyMapLink(e.target.value)} className="mt-1 block w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500">Địa chỉ cụ thể nơi tổ chức</label>
                <input type="text" placeholder="Tư gia nhà trai..." value={ceremonyLocation} onChange={e => setCeremonyLocation(e.target.value)} className="mt-1 block w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" />
              </div>
              <div>
                <label className="block text-xs text-slate-500">Mã nhúng bản đồ Google (Iframe HTML)</label>
                <textarea rows={2} placeholder="<iframe src='...' ...></iframe>" value={ceremonyMapIframe} onChange={e => setCeremonyMapIframe(e.target.value)} className="mt-1 block w-full text-xs font-mono rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 p-3" />
              </div>
            </div>

            {/* Party Event */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <h3 className="text-xs font-bold text-indigo-600 border-b pb-2 border-slate-100 uppercase tracking-wide">SỰ KIỆN 2: TIỆC CƯỚI MỪNG (NHÀ HÀNG / TƯ GIA)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs text-slate-500">Tiêu đề tiệc (ví dụ: LỄ THÀNH HÔN, TIỆC CƯỚI)</label>
                  <input type="text" value={partyTitle} onChange={e => setPartyTitle(e.target.value)} className="mt-1 block w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-xs text-slate-500">Giờ khai tiệc</label>
                  <input type="text" placeholder="17:30 - Thứ Bảy 01.08.2026" value={partyTime} onChange={e => setPartyTime(e.target.value)} className="mt-1 block w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500">Link chỉ đường (Google Maps URL)</label>
                  <input type="text" placeholder="https://maps.app.goo.gl/..." value={partyMapLink} onChange={e => setPartyMapLink(e.target.value)} className="mt-1 block w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500">Địa chỉ cụ thể nơi tổ chức tiệc</label>
                <input type="text" placeholder="Nhà hàng Grand Palace..." value={partyLocation} onChange={e => setPartyLocation(e.target.value)} className="mt-1 block w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" />
              </div>
              <div>
                <label className="block text-xs text-slate-500">Mã nhúng bản đồ Google (Iframe HTML)</label>
                <textarea rows={2} placeholder="<iframe src='...' ...></iframe>" value={partyMapIframe} onChange={e => setPartyMapIframe(e.target.value)} className="mt-1 block w-full text-xs font-mono rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 p-3" />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Media */}
        {activeTab === 'media' && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
            <h3 className="text-sm font-bold text-slate-800 border-b pb-3 border-slate-100 uppercase tracking-wide">Bộ Sưu Tập Ảnh Cưới &amp; Nhạc Nền</h3>

            {/* Music */}
            <div>
              <label className="block text-sm font-semibold text-slate-700">Đường dẫn file nhạc nền (.mp3 URL)</label>
              <input
                type="text"
                placeholder="https://..."
                value={musicUrl}
                onChange={e => setMusicUrl(e.target.value)}
                className="mt-1 block w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
              />
              <p className="text-xs text-slate-400 mt-1.5">Nhập liên kết nhạc cưới `.mp3` trực tiếp hoặc giữ nguyên nhạc mặc định có sẵn.</p>
            </div>

            {/* Upload photos */}
            <div className="pt-6 border-t border-slate-100">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tải ảnh lên Album cưới (Tối đa 10MB)</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer"
                />
                {uploading && <span className="text-xs text-indigo-600 font-bold animate-pulse">Đang tải lên...</span>}
              </div>

              {/* Photos list grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                {photosList.map((url, idx) => (
                  <div key={idx} className="relative group border border-slate-100 rounded-2xl overflow-hidden h-28 bg-slate-50 shadow-sm">
                    <img src={url} alt={`Wedding photo ${idx}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(url)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-xs transition-opacity"
                    >
                      Xóa ảnh
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Settings & Bank */}
        {activeTab === 'settings' && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-8">

            {/* Toggle Sections */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-800 border-b pb-2 border-slate-100 uppercase tracking-wide">HIỂN THỊ CÁC PHẦN TRÊN TRANG (LAYOUT SECTIONS)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Object.keys(activeSections).map((key) => (
                  <label
                    key={key}
                    className="flex items-center gap-3 p-3 border border-slate-150 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={activeSections[key]}
                      onChange={() => handleSectionToggle(key)}
                      className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-bold uppercase text-slate-600">
                      {key === 'music' && 'Nhạc nền'}
                      {key === 'calendar' && 'Lịch trái tim'}
                      {key === 'maps' && 'Bản đồ chỉ đường'}
                      {key === 'rsvp' && 'Xác nhận tham dự'}
                      {key === 'gallery' && 'Album hình cưới'}
                      {key === 'gift' && 'Quà mừng cưới'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Bank Account info */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 border-b pb-2 border-slate-100 uppercase tracking-wide">CẤU HÌNH TÀI KHOẢN NGÂN HÀNG (QUÀ MỪNG CƯỚI - QR CODE)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs text-slate-500">Mã ngân hàng (ví dụ: vietcombank, bidv, acb...)</label>
                  <input
                    type="text"
                    placeholder="vietcombank, bidv, acb, techcombank..."
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    className="mt-1 block w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Sử dụng tên viết tắt ngân hàng Napas (ví dụ: vietcombank, bidv, acb, techcombank).</p>
                </div>
                <div>
                  <label className="block text-xs text-slate-500">Số tài khoản</label>
                  <input type="text" value={bankAccount} onChange={e => setBankAccount(e.target.value)} className="mt-1 block w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500">Tên chủ tài khoản (Chữ in hoa không dấu)</label>
                  <input type="text" placeholder="LE HUU QUAN" value={bankHolderName} onChange={e => setBankHolderName(e.target.value)} className="mt-1 block w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
          <Link
            href="/dashboard"
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm px-6 py-3 rounded-xl transition-all"
          >
            Quay lại Dashboard
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-indigo-100 disabled:bg-slate-300 transition-all"
          >
            {loading ? 'Đang lưu...' : 'Lưu Cấu Hình'}
          </button>
        </div>
      </form>
    </div>
  );
}
