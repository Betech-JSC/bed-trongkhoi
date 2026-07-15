import { NextRequest, NextResponse } from 'next/server';
import { getLoggedInUser } from '@/lib/auth';
import db from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  const user = await getLoggedInUser();
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

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

  if (!wedding || wedding.userId !== user.id) {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  try {
    const data = await request.formData();
    const file: File | null = data.get('photo') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No photo provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save locally to public/uploads/wedding
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${extension}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'wedding');
    
    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    const filePath = join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const relativeUrl = `/uploads/wedding/${filename}`;

    // Update in database
    const currentPhotos = JSON.parse(wedding.albumPhotos || '[]');
    currentPhotos.push(relativeUrl);

    await db.wedding.update({
      where: { id: wedding.id },
      data: {
        albumPhotos: JSON.stringify(currentPhotos)
      }
    });

    return NextResponse.json({
      success: true,
      url: relativeUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 });
  }
}
