'use server';

import { getSupabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function updateGroupNo(id: string, groupNo: number | null) {
  if (!id) return { success: false, error: 'ID가 누락되었습니다.' };

  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin
    .from('responses')
    .update({ group_no: groupNo })
    .eq('id', id);

  if (error) {
    console.error('Error updating group number:', error);
    return { success: false, error: '조 번호 업데이트에 실패했습니다.' };
  }

  return { success: true };
}

export async function wipeSessionResponses(session: string) {
  if (!session) return { success: false, error: '세션 정보가 누락되었습니다.' };

  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin
    .from('responses')
    .delete()
    .eq('session', session);

  if (error) {
    console.error('Error wiping session responses:', error);
    return { success: false, error: '응답 삭제에 실패했습니다.' };
  }

  return { success: true };
}
