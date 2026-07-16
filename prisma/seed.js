import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('dinhtrongkhoi300920@gmail.com', 12);
  
  // Clean database
  await prisma.rsvpResponse.deleteMany({});
  await prisma.wedding.deleteMany({});
  await prisma.user.deleteMany({});

  const user = await prisma.user.create({
    data: {
      name: 'Đinh Trọng Khôi',
      email: 'dinhtrongkhoi300920@gmail.com',
      password: passwordHash,
    }
  });

  const wedding = await prisma.wedding.create({
    data: {
      userId: user.id,
      slug: 'KHOI&VAN',
      template: 'RedWhite',
      groomName: 'Đinh Trọng Khôi',
      groomShortName: 'Trọng Khôi',
      groomFather: 'ÔNG ĐINH VĂN TRUNG',
      groomMother: 'BÀ TRẦN THỊ CHI',
      groomAddress: '130 Nguyễn Huệ, P. Quy Nhơn, T. Gia Lai',
      brideName: 'Đỗ Thanh Vân',
      brideShortName: 'Thanh Vân',
      brideFather: 'ÔNG ĐỖ MINH',
      brideMother: 'BÀ HÀ THỊ MINH NGUYỆT',
      brideAddress: 'Xóm chánh, thôn Kiều Huyên, x. Phù Cát, T. Gia Lai',
      weddingDate: '2026-08-01',
      ceremonyTitle: 'LỄ TÂN HÔN',
      ceremonyTime: '11:00 - Thứ Tư 16.09.2026',
      ceremonyLocation: 'Tư Gia Nhà Trai (130 Nguyễn Huệ, P. Quy Nhơn, T. Gia Lai)',
      ceremonyMapLink: 'https://www.google.com/maps/search/?api=1&query=130+Nguyễn+Huệ+Quy+Nhơn+Gia+Lai',
      partyTitle: 'LỄ THÀNH HÔN',
      partyTime: '17:30 - Thứ Bảy 01.08.2026',
      partyLocation: 'Trung Tâm Tiệc Cưới Grand Palace (Sáu Cao 2 - Sảnh 3) - Cầu 2 Hà Thanh, Đường Võ Nguyên Giáp, P. Quy Nhơn, T. Gia Lai',
      partyMapLink: 'https://www.google.com/maps/search/?api=1&query=Trung+Tâm+Tiệc+Cưới+Grand+Palace+Sáu+Cao+Quy+Nhơn',
      partyMapIframe: '<iframe src="https://maps.google.com/maps?q=Trung%20T%C3%A2m%20Ti%E1%BB%87c%20C%C6%B0%E1%BB%9Bi%20Grand%20Palace%20S%C3%A1u%20Cao%20Quy%20Nh%C6%A1n&t=&z=15&ie=UTF8&iwloc=&output=embed" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
      musicUrl: 'https://statics.pancake.vn/web-media/5e/ee/bf/4a/afa10d3bdf98ca17ec3191ebbfd3c829d135d06939ee1f1b712d731d-w:0-h:0-l:2938934-t:audio/mpeg.mp3',
      albumPhotos: JSON.stringify([
        '/images/wedding_1.jpg',
        '/images/wedding_2.jpg',
        '/images/wedding_3.jpg',
      ]),
      activeSections: JSON.stringify({
        music: true,
        calendar: true,
        maps: true,
        rsvp: true,
        gallery: true,
        gift: true,
      }),
      bankName: '',
      bankAccount: '',
      bankHolderName: '',
    }
  });

  console.log('Database seeded successfully!', { user: user.email, wedding: wedding.slug });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
