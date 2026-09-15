'use server';

import { createClient } from '@supabase/supabase-js';
import { Answers } from '@/lib/questions';

function getAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes('placeholder')) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function submitSurvey(
  session: string,
  displayName: string,
  phone: string,
  affiliation: string,
  answers: Answers
) {
  if (!session) return { success: false, error: '세션 정보가 누락되었습니다.' };
  if (!displayName?.trim()) return { success: false, error: '이름을 정해주세요.' };
  if (!phone?.trim()) return { success: false, error: '연락처를 입력해주세요.' };
  if (!affiliation?.trim()) return { success: false, error: '소속을 입력해주세요.' };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey || url.includes('placeholder') || url.includes('your-supabase')) {
    return {
      success: false,
      error: '서버 환경변수(NEXT_PUBLIC_SUPABASE_URL / ANON_KEY)가 올바르게 설정되지 않았습니다. Vercel 설정을 확인해주세요.',
    };
  }

  const client = getAnonClient();
  if (!client) {
    return { success: false, error: 'Supabase 클라이언트를 초기화할 수 없습니다.' };
  }

  try {
    const { error } = await client
      .from('responses')
      .insert([{
        session,
        display_name: displayName.trim(),
        phone: phone.trim(),
        affiliation: affiliation.trim(),
        answers,
      }]);

    if (error) {
      console.error('Supabase insert error:', error);
      return {
        success: false,
        error: `응답 저장에 실패했습니다. (상세 에러: ${error.message} [코드: ${error.code}])`,
      };
    }

    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('submitSurvey exception:', msg);
    return {
      success: false,
      error: `응답 저장에 실패했습니다. (상세 에러: ${msg} [코드: ])`,
    };
  }
}
