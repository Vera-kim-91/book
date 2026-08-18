'use server';

import { cookies } from 'next/headers';

export async function loginAdmin(password: string) {
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedPassword) {
    return { success: false, error: '서버에 관리자 비밀번호가 설정되어 있지 않습니다.' };
  }

  if (password === expectedPassword) {
    const cookieStore = await cookies();
    cookieStore.set('admin_token', password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });
    return { success: true };
  }

  return { success: false, error: '비밀번호가 올바르지 않습니다.' };
}
