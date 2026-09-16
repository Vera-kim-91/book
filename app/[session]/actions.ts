'use server';

import { insertResponse, updateGroupNo as dbUpdateGroupNo, deleteSessionResponses } from '@/lib/db';
import { Answers } from '@/lib/questions';

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

  if (!process.env.DATABASE_URL) {
    return { success: false, error: 'DATABASE_URL 환경변수가 설정되지 않았습니다.' };
  }

  try {
    await insertResponse({
      session,
      display_name: displayName.trim(),
      phone: phone.trim(),
      affiliation: affiliation.trim(),
      answers: answers as Record<string, unknown>,
    });
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('submitSurvey error:', msg);
    return {
      success: false,
      error: `응답 저장에 실패했습니다. (${msg})`,
    };
  }
}
