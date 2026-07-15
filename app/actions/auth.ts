'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import db from '@/lib/db';
import { comparePassword, encrypt, hashPassword } from '@/lib/auth';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Vui lòng nhập đầy đủ email và mật khẩu.' };
  }

  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { error: 'Tài khoản hoặc mật khẩu không chính xác.' };
  }

  const passwordMatch = await comparePassword(password, user.password);
  if (!passwordMatch) {
    return { error: 'Tài khoản hoặc mật khẩu không chính xác.' };
  }

  // Create session
  const sessionToken = await encrypt({ userId: user.id, email: user.email });

  // Set cookie
  cookies().set('session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  redirect('/dashboard');
}

export async function registerAction(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirm_password') as string;

  if (!name || !email || !password) {
    return { error: 'Vui lòng điền đầy đủ các thông tin.' };
  }

  if (password !== confirmPassword) {
    return { error: 'Mật khẩu xác nhận không trùng khớp.' };
  }

  // Check unique email
  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: 'Email này đã được đăng ký sử dụng.' };
  }

  const hashedPassword = await hashPassword(password);

  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // Create session
  const sessionToken = await encrypt({ userId: user.id, email: user.email });

  // Set cookie
  cookies().set('session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  redirect('/dashboard');
}

export async function logoutAction() {
  cookies().delete('session');
  redirect('/login');
}
