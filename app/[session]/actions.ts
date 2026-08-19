'use server';

import { supabase } from '@/lib/supabase';
import { Answers } from '@/lib/questions';

export async function submitSurvey(
  session: string,
  displayName: string,
  answers: Answers
) {
  if (!session) {
    return { success: false, error: '세션 정보가 누락되었습니다.' };
  }
  if (!displayName || !displayName.trim()) {
    return { success: false, error: '이름을 정해주세요.' };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey || url.includes('placeholder') || url.includes('your-supabase')) {
    return { 
      success: false, 
      error: '서버 환경변수(NEXT_PUBLIC_SUPABASE_URL / ANON_KEY)가 올바르게 설정되지 않았습니다. Vercel 설정을 확인해주세요.' 
    };
  }

  const { error } = await supabase
    .from('responses')
    .insert([
      {
        session,
        display_name: displayName.trim(),
        answers,
      },
    ]);

  if (error) {
    console.error('Error submitting survey:', error);
    return { 
      success: false, 
      error: `응답 저장에 실패했습니다. (상세 에러: ${error.message} [코드: ${error.code}])` 
    };
  }

  return { success: true };
}
