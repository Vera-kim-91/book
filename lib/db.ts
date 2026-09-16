import { neon } from '@neondatabase/serverless';
import { CurationResponse } from './questions';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL 환경변수가 없습니다.');
  return neon(url);
}

/** responses 테이블 생성 (최초 1회) */
export async function ensureTable() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS responses (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session      TEXT NOT NULL,
      display_name TEXT NOT NULL,
      phone        TEXT,
      affiliation  TEXT,
      answers      JSONB NOT NULL DEFAULT '{}',
      group_no     INTEGER,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

/** 응답 저장 (익명 삽입) */
export async function insertResponse(data: {
  session: string;
  display_name: string;
  phone: string;
  affiliation: string;
  answers: Record<string, unknown>;
}) {
  const sql = getDb();
  await sql`
    INSERT INTO responses (session, display_name, phone, affiliation, answers)
    VALUES (${data.session}, ${data.display_name}, ${data.phone}, ${data.affiliation}, ${JSON.stringify(data.answers)})
  `;
}

/** 세션별 응답 전체 조회 */
export async function getResponses(session: string): Promise<CurationResponse[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT id, session, display_name, phone, affiliation, answers, group_no, created_at
    FROM responses
    WHERE session = ${session}
    ORDER BY created_at ASC
  `;
  return rows as unknown as CurationResponse[];
}

/** 조 번호 업데이트 */
export async function updateGroupNo(id: string, groupNo: number | null) {
  const sql = getDb();
  await sql`
    UPDATE responses SET group_no = ${groupNo} WHERE id = ${id}
  `;
}

/** 세션 응답 전체 삭제 */
export async function deleteSessionResponses(session: string) {
  const sql = getDb();
  await sql`
    DELETE FROM responses WHERE session = ${session}
  `;
}
