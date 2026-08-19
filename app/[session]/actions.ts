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
    return { success: false, error: '응답 저장에 실패했습니다. 다시 시도해 주세요.' };
  }

  return { success: true };
}
