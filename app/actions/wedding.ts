'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import db from '@/lib/db';
import { getLoggedInUser } from '@/lib/auth';

export async function deleteWeddingAction(slug: string) {
  const user = await getLoggedInUser();
  if (!user) {
    return { error: 'Bạn cần đăng nhập để thực hiện.' };
  }

  const wedding = await db.wedding.findUnique({
    where: { slug }
  });

  if (!wedding || wedding.userId !== user.id) {
    return { error: 'Không tìm thấy thiệp cưới hoặc bạn không có quyền xóa.' };
  }

  await db.wedding.delete({
    where: { slug }
  });

  revalidatePath('/dashboard');
  return { success: true };
}

export async function createWeddingAction(formData: FormData) {
  const user = await getLoggedInUser();
  if (!user) {
    return { error: 'Bạn cần đăng nhập để thực hiện.' };
  }

  const slug = formData.get('slug') as string;
  const template = formData.get('template') as string;
  const groomName = formData.get('groom_name') as string;
  const groomShortName = formData.get('groom_short_name') as string;
  const brideName = formData.get('bride_name') as string;
  const brideShortName = formData.get('bride_short_name') as string;
  const weddingDate = formData.get('wedding_date') as string;

  if (!slug || !template || !groomName || !brideName || !weddingDate) {
    return { error: 'Vui lòng điền đầy đủ các thông tin bắt buộc.' };
  }

  // Validate alpha-dash slug format
  const slugRegex = /^[a-zA-Z0-9-_&]+$/;
  if (!slugRegex.test(slug)) {
    return { error: 'Đường dẫn thiệp cưới chỉ chứa chữ, số, dấu gạch ngang và dấu &.' };
  }

  // Check unique slug
  const existingWedding = await db.wedding.findUnique({
    where: { slug }
  });

  if (existingWedding) {
    return { error: 'Đường dẫn thiệp cưới này đã tồn tại, vui lòng chọn tên khác.' };
  }

  const defaultSections = {
    music: true,
    calendar: true,
    maps: true,
    rsvp: true,
    gallery: true,
    gift: true,
  };

  const newWedding = await db.wedding.create({
    data: {
      userId: user.id,
      slug,
      template,
      groomName,
      groomShortName,
      brideName,
      brideShortName,
      weddingDate,
      activeSections: JSON.stringify(defaultSections),
      albumPhotos: JSON.stringify([]),
    }
  });

  redirect(`/${newWedding.slug}/edit`);
}

export async function updateWeddingAction(slug: string, data: any) {
  const user = await getLoggedInUser();
  if (!user) {
    return { error: 'Bạn cần đăng nhập để thực hiện.' };
  }

  const wedding = await db.wedding.findUnique({
    where: { slug }
  });

  if (!wedding || wedding.userId !== user.id) {
    return { error: 'Không tìm thấy thiệp cưới hoặc bạn không có quyền cập nhật.' };
  }

  const newSlug = data.slug;
  if (newSlug && newSlug !== slug) {
    const existingSlug = await db.wedding.findUnique({
      where: { slug: newSlug }
    });
    if (existingSlug) {
      return { error: 'Đường dẫn thiệp cưới mới này đã tồn tại.' };
    }
  }

  await db.wedding.update({
    where: { slug },
    data: {
      slug: data.slug,
      template: data.template,
      groomName: data.groomName,
      groomShortName: data.groomShortName,
      groomFather: data.groomFather,
      groomMother: data.groomMother,
      groomAddress: data.groomAddress,
      brideName: data.brideName,
      brideShortName: data.brideShortName,
      brideFather: data.brideFather,
      brideMother: data.brideMother,
      brideAddress: data.brideAddress,
      weddingDate: data.weddingDate,
      ceremonyTitle: data.ceremonyTitle,
      ceremonyTime: data.ceremonyTime,
      ceremonyLocation: data.ceremonyLocation,
      ceremonyMapIframe: data.ceremonyMapIframe,
      ceremonyMapLink: data.ceremonyMapLink,
      partyTitle: data.partyTitle,
      partyTime: data.partyTime,
      partyLocation: data.partyLocation,
      partyMapIframe: data.partyMapIframe,
      partyMapLink: data.partyMapLink,
      musicUrl: data.musicUrl,
      albumPhotos: JSON.stringify(data.albumPhotos || []),
      activeSections: JSON.stringify(data.activeSections || {}),
      bankName: data.bankName,
      bankAccount: data.bankAccount,
      bankHolderName: data.bankHolderName,
    }
  });

  revalidatePath('/dashboard');
  revalidatePath(`/${data.slug}`);
  revalidatePath(`/${data.slug}/edit`);

  return { success: true };
}
