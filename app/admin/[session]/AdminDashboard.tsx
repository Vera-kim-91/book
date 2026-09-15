'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  QUESTIONS,
  GENRES,
  codeOf,
  themes,
  genreLikes,
  stops,
  star,
  CurationResponse,
} from '@/lib/questions';
import { updateGroupNo, wipeSessionResponses } from './actions';

interface AdminDashboardProps {
  session: string;
  initialResponses: CurationResponse[];
}

const Q = (id: string) => QUESTIONS.find((q) => q.id === id);

export default function AdminDashboard({
  session,
  initialResponses,
}: AdminDashboardProps) {
  const router = useRouter();
  const [responses, setResponses] = useState<CurationResponse[]>(initialResponses);

  // 1. Group change handler
  const handleGroupChange = async (id: string, value: string) => {
    const groupNo = value === '' ? null : parseInt(value, 10);
    setResponses((prev) =>
      prev.map((r) => (r.id === id ? { ...r, group_no: groupNo } : r))
    );
    const res = await updateGroupNo(id, groupNo);
    if (!res.success) { alert(res.error); router.refresh(); }
  };

  // 2. Wipe handler
  const handleWipe = async () => {
    if (!confirm('응답을 전부 삭제합니다. 되돌릴 수 없습니다.')) return;
    const res = await wipeSessionResponses(session);
    if (res.success) { setResponses([]); alert('모든 응답이 삭제되었습니다.'); }
    else alert(res.error);
  };

  // 3. CSV download
  const downloadCsv = () => {
    const head = [
      '#', '이름', '연락처', '소속', '조',
      '끌리는 경험', '좋았던 책', '이유',
      '선호 장르', '기피 장르',
      '두께', '도달점', '문장', '책과의 거리',
      '이탈지점', '원하는 톤', '도서 준비',
      '가져올 책 제목', '덮어둔 책', '우선',
    ];

    const rows = responses.map((r, i) => {
      const a = r.answers;
      const q4 = Q('q4'); const q5 = Q('q5');
      const q6 = Q('q6'); const q7 = Q('q7');
      const q9 = Q('q9'); const q10 = Q('q10');

      const genreAvoidLabel = (() => {
        const av = a.q3?.avoid;
        if (av == null) return '';
        if (av === 8) return '특별히 없음';
        return GENRES[av] ?? '';
      })();

      return [
        String(i + 1).padStart(2, '0'),
        r.display_name,
        r.phone ?? '',
        r.affiliation ?? '',
        r.group_no != null ? String(r.group_no) : '',
        themes(a),
        a.q2?.title ?? '',
        a.q2?.why ?? '',
        genreLikes(a),
        genreAvoidLabel,
        q4 && 'code' in q4 ? codeOf(q4, a.q4) : '',
        q5 && 'code' in q5 ? codeOf(q5, a.q5) : '',
        q6 && 'code' in q6 ? codeOf(q6, a.q6) : '',
        q7 && 'code' in q7 ? codeOf(q7, a.q7) : '',
        stops(a),
        q9 && 'code' in q9 ? codeOf(q9, a.q9) : '',
        q10 && 'code' in q10 ? codeOf(q10, a.q10?.mode) : '',
        a.q10?.mode === 1 ? (a.q10.book ?? '') : '',
        a.q11?.v ?? '',
        star(a) ? '★' : '',
      ];
    });

    const csvContent =
      '\uFEFF' +
      [head, ...rows]
        .map((row) => row.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `off-book-curation-${session}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const n = responses.length;

  return (
    <div className="adminwrap">
      {/* Header */}
      <div className="abar noprint">
        <h1>사전 읽기 진단 · 큐레이션 시트</h1>
        <span className="cnt">응답 {n}</span>
      </div>

      {/* Toolbar */}
      <div className="tools noprint">
        <button className="btn primary" onClick={() => window.print()}>카드 인쇄 / PDF</button>
        <button className="btn" onClick={downloadCsv}>현황표 CSV</button>
        <button className="btn" onClick={() => router.push(`/${encodeURIComponent(session)}`)}>설문 화면</button>
        <button className="btn" onClick={handleWipe}>응답 전체 삭제</button>
      </div>

      {/* Table */}
      <div id="tbl" className="noprint" style={{ marginBottom: '40px' }}>
        {n === 0 ? (
          <div className="none">아직 응답이 없습니다. 설문 화면에서 먼저 응답해 보세요.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>이름</th>
                <th>연락처</th>
                <th>소속</th>
                <th>조</th>
                <th>끌리는 경험</th>
                <th>선호 장르</th>
                <th>기피 장르</th>
                <th>두께</th>
                <th>도달점</th>
                <th>문장</th>
                <th>책과의 거리</th>
                <th>이탈지점</th>
                <th>원하는 톤</th>
                <th>도서 준비</th>
                <th>우선</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((r, i) => {
                const a = r.answers;
                const q4 = Q('q4'); const q5 = Q('q5');
                const q6 = Q('q6'); const q7 = Q('q7');
                const q9 = Q('q9'); const q10 = Q('q10');

                const avoidLabel = (() => {
                  const av = a.q3?.avoid;
                  if (av == null) return '—';
                  if (av === 8) return '특별히 없음';
                  return GENRES[av] ?? '—';
                })();

                return (
                  <tr key={r.id}>
                    <td className="n">{String(i + 1).padStart(2, '0')}</td>
                    <td style={{ fontWeight: 600 }}>{r.display_name}</td>
                    <td>{r.phone ?? '—'}</td>
                    <td>{r.affiliation ?? '—'}</td>
                    <td>
                      <select value={r.group_no != null ? String(r.group_no) : ''} onChange={(e) => handleGroupChange(r.id, e.target.value)}>
                        <option value=""></option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                      </select>
                    </td>
                    <td>{themes(a) || '—'}</td>
                    <td className="n">{genreLikes(a) || '—'}</td>
                    <td className="n">{avoidLabel}</td>
                    <td className="n">{q4 && 'code' in q4 ? codeOf(q4, a.q4) : '—'}</td>
                    <td className="n">{q5 && 'code' in q5 ? codeOf(q5, a.q5) : '—'}</td>
                    <td className="n">{q6 && 'code' in q6 ? codeOf(q6, a.q6) : '—'}</td>
                    <td className="n">{q7 && 'code' in q7 ? codeOf(q7, a.q7) : '—'}</td>
                    <td className="n">{stops(a) || '—'}</td>
                    <td className="n">{q9 && 'code' in q9 ? codeOf(q9, a.q9) : '—'}</td>
                    <td className="n">{q10 && 'code' in q10 ? codeOf(q10, a.q10?.mode) : '—'}</td>
                    <td className="star">{star(a) ? '★' : ''}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Cards */}
      <div id="cards" className="cards">
        {responses.map((r, i) => {
          const a = r.answers;
          const t = a.q2 ?? { title: '', why: '' };
          const b = a.q10 ?? { mode: -1, book: '' };
          const q4 = Q('q4'); const q5 = Q('q5');
          const q6 = Q('q6'); const q7 = Q('q7');
          const q9 = Q('q9');

          const isPrioritized = star(a);

          const avoidLabel = (() => {
            const av = a.q3?.avoid;
            if (av == null) return null;
            if (av === 8) return '특별히 없음';
            return GENRES[av] ?? null;
          })();

          const cells = [
            ['선호 장르', genreLikes(a) || '—'],
            ['두께', q4 && 'opts' in q4 && q4.opts && a.q4 !== undefined ? q4.opts[a.q4] : '—'],
            ['그날의 도달점', q5 && 'opts' in q5 && q5.opts && a.q5 !== undefined ? q5.opts[a.q5] : '—'],
            ['문장', q6 && 'opts' in q6 && q6.opts && a.q6 !== undefined ? q6.opts[a.q6] : '—'],
            ['책과의 거리', q7 && 'opts' in q7 && q7.opts && a.q7 !== undefined ? q7.opts[a.q7] : '—'],
            ['이탈 지점', stops(a) || '—'],
            ['원하는 톤', q9 && 'opts' in q9 && q9.opts && a.q9 !== undefined ? q9.opts[a.q9] : '—'],
          ];

          return (
            <article className="card" key={r.id}>
              {/* Card Header */}
              <div className="chead">
                <span className="cid">#{String(i + 1).padStart(2, '0')}</span>
                <span className="cname">{r.display_name}</span>
                <span className="cgrp">{r.group_no != null ? `${r.group_no}조` : '조 미정'}</span>
                {isPrioritized && <span className="cflag">우선</span>}
              </div>

              {/* 끌리는 경험 (q1) */}
              <div className="quote">
                <span className="qlab">끌림</span>
                <div className="v" style={{ fontSize: '14.5px' }}>{themes(a) || '—'}</div>
              </div>

              {/* 좋았던 책 (q2) */}
              <div className="quote">
                <span className="qlab">좋았던 책</span>
                {t.title ? (
                  <>
                    <div className="qtitle">「{t.title}」</div>
                    {t.why && <div className="qwhy">{t.why}</div>}
                  </>
                ) : (
                  <div className="empty">응답 없음</div>
                )}
              </div>

              {/* 기피 장르 (q3 avoid) — 있을 때만 */}
              {avoidLabel && (
                <div className="quote">
                  <span className="qlab">기피 장르</span>
                  <div className="v">{avoidLabel}</div>
                </div>
              )}

              {/* 덮어둔 책 (q11) */}
              <div className="quote">
                <span className="qlab">덮어둔 책</span>
                {a.q11?.v ? (
                  <div className="qtitle" style={{ fontSize: '16px' }}>{a.q11.v}</div>
                ) : (
                  <div className="empty">없음</div>
                )}
              </div>

              {/* 가져올 책 (q10 mode=1) */}
              {b.mode === 1 && b.book && (
                <div className="quote" style={{ marginTop: '22px' }}>
                  <span className="qlab">가져올 책</span>
                  <div className="qtitle" style={{ fontSize: '16px' }}>「{b.book}」</div>
                </div>
              )}

              {/* 3x2 Grid */}
              <div className="grid">
                {cells.map(([label, val], idx) => (
                  <div className="cell" key={idx}>
                    <span className="k">{label}</span>
                    <span className="v">{val}</span>
                  </div>
                ))}
              </div>

              {/* 큐레이터 기입란 */}
              <div className="fill">
                <div className="fl">
                  <span className="k">준비한 책</span>
                  <span className="line"></span>
                </div>
                <div className="fl">
                  <span className="k">고른 이유</span>
                  <span className="line"></span>
                </div>
                <div className="picks">
                  당일 선택 &nbsp;&nbsp;
                  {b.mode === 1 ? '☑' : '□'} 스스로 준비한 책{b.mode === 1 && b.book ? `: ${b.book}` : ''}
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  {b.mode === 0 ? '☑' : '□'} 현장에서 추천받기
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
