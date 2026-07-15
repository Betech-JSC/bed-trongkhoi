import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
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
    return NextResponse.json({ success: false, message: 'Không tìm thấy thông tin thiệp cưới.' }, { status: 404 });
  }

  try {
    const data = await request.json();
    const { guest_name, relation, wishes, attendance_status } = data;

    if (!guest_name || !attendance_status) {
      return NextResponse.json({ success: false, message: 'Vui lòng điền đầy đủ tên và trạng thái tham gia.' }, { status: 400 });
    }

    const rsvp = await db.rsvpResponse.create({
      data: {
        weddingId: wedding.id,
        guestName: guest_name,
        relation: relation || '',
        wishes: wishes || '',
        attendanceStatus: attendance_status
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Cảm ơn bạn đã gửi phản hồi xác nhận tham dự!',
      data: rsvp
    });
  } catch (error) {
    console.error('RSVP error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi máy chủ khi lưu phản hồi.' }, { status: 500 });
  }
}
