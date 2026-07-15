import bcrypt from 'bcryptjs';
import * as jose from 'jose';
import { cookies } from 'next/headers';
import db from './db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-key-change-me-in-production-123456789'
);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function encrypt(payload: any) {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jose.jwtVerify(input, JWT_SECRET, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getSession() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session');
  if (!sessionCookie) return null;
  return await decrypt(sessionCookie.value);
}

export async function getLoggedInUser() {
  const session = await getSession();
  if (!session || !session.userId) return null;
  
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true },
  });
  return user;
}
