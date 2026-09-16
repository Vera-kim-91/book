'use server';

import { updateGroupNo as dbUpdateGroupNo, deleteSessionResponses } from '@/lib/db';

export async function updateGroupNo(id: string, groupNo: number | null) {
  if (!id) return { success: false, error: 'ID가 누락되었습니다.' };
  try {
    await dbUpdateGroupNo(id, groupNo);
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('updateGroupNo error:', msg);
    return { success: false, error: '조 번호 업데이트에 실패했습니다.' };
  }
}

export async function wipeSessionResponses(session: string) {
  if (!session) return { success: false, error: '세션 정보가 누락되었습니다.' };
  try {
    await deleteSessionResponses(session);
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('wipeSessionResponses error:', msg);
    return { success: false, error: '응답 삭제에 실패했습니다.' };
  }
}
