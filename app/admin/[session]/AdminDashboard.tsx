'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  QUESTIONS,
  codeOf,
  themes,
  stops,
  star,
  CurationResponse,
  Answers,
} from '@/lib/questions';
import { updateGroupNo, wipeSessionResponses } from './actions';

interface AdminDashboardProps {
  session: string;
  initialResponses: CurationResponse[];
}

export default function AdminDashboard({
  session,
  initialResponses,
}: AdminDashboardProps) {
  const router = useRouter();
  const [responses, setResponses] = useState<CurationResponse[]>(initialResponses);

  // 1. Group change handler
  const handleGroupChange = async (id: string, value: string) => {
    const groupNo = value === '' ? null : parseInt(value, 10);

    // Update local state for immediate feedback
    setResponses((prev) =>
      prev.map((r) => (r.id === id ? { ...r, group_no: groupNo } : r))
    );

    const res = await updateGroupNo(id, groupNo);
    if (!res.success) {
      alert(res.error);
      // Revert if error
      router.refresh();
    }
  };

  // 2. Wipe session responses handler
  const handleWipe = async () => {
    if (!confirm('응답을 전부 삭제합니다. 되돌릴 수 없습니다.')) return;

    const res = await wipeSessionResponses(session);
    if (res.success) {
      setResponses([]);
      alert('모든 응답이 삭제되었습니다.');
    } else {
      alert(res.error);
    }
  };

  // 3. Download CSV
  const downloadCsv = () => {
    const head = [
      '#',
      '이름',
      '연락처',
      '소속',
      '조',
      '주제',
      '선호하는 분량',
      '좋아하는 문장형태',
      '책과 나의 거리',
      '멈추게 되는 지점',
      '모임에서 원하는 것',
      '준비',
      '우선',
      '좋았던것',
      '이유',
      '덮어둔것',
    ];

    const rows = responses.map((r, i) => {
      const a = r.answers;
      const t = a.q2 || { title: '', why: '' };
      const d = a.q10 || { v: '' };
      return [
        String(i + 1).padStart(2, '0'),
        r.display_name,
        r.phone || '',
        r.affiliation || '',
        r.group_no !== null ? String(r.group_no) : '',
        themes(a),
        codeOf(QUESTIONS[2], a.q3),
        codeOf(QUESTIONS[3], a.q4),
        codeOf(QUESTIONS[4], a.q5),
        stops(a),
        codeOf(QUESTIONS[7], a.q8),
        a.q9 ? codeOf(QUESTIONS[8], a.q9.mode) : '',
        star(a) ? '★' : '',
        t.title || '',
        t.why || '',
        d.v || '',
      ];
    });

    // UTF-8 BOM to prevent Excel encoding issues
    const csvContent =
      '\uFEFF' +
      [head, ...rows]
        .map((r) =>
          r
            .map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`)
            .join(',')
        )
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
      {/* Header Panel (Hidden when printing) */}
      <div className="abar noprint">
        <h1>사전 읽기 진단 · 큐레이션 시트</h1>
        <span className="cnt">응답 {n}</span>
      </div>

      {/* Toolbar Panel (Hidden when printing) */}
      <div className="tools noprint">
        <button className="btn primary" onClick={() => window.print()}>
          카드 인쇄 / PDF
        </button>
        <button className="btn" onClick={downloadCsv}>
          현황표 CSV
        </button>
        <button className="btn" onClick={() => router.push(`/${encodeURIComponent(session)}`)}>
          설문 화면
        </button>
        <button className="btn" onClick={handleWipe}>
          응답 전체 삭제
        </button>
      </div>

      {/* 1. Curation Table (Hidden when printing) */}
      <div id="tbl" className="noprint" style={{ marginBottom: '40px' }}>
        {n === 0 ? (
          <div className="none">
            아직 응답이 없습니다. 설문 화면에서 먼저 응답해 보세요.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>이름</th>
                <th>연락처</th>
                <th>소속</th>
                <th>조</th>
                <th>주제</th>
                <th>선호하는 분량</th>
                <th>좋아하는 문장형태</th>
                <th>책과 나의 거리</th>
                <th>멈추게 되는 지점</th>
                <th>모임에서 원하는 것</th>
                <th>준비</th>
                <th>우선</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((r, i) => {
                const a = r.answers;
                return (
                  <tr key={r.id}>
                    <td className="n">{String(i + 1).padStart(2, '0')}</td>
                    <td style={{ fontWeight: 600 }}>{r.display_name}</td>
                    <td>{r.phone || '—'}</td>
                    <td>{r.affiliation || '—'}</td>
                    <td>
                      <select
                        value={r.group_no !== null ? String(r.group_no) : ''}
                        onChange={(e) => handleGroupChange(r.id, e.target.value)}
                      >
                        <option value=""></option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                      </select>
                    </td>
                    <td>{themes(a)}</td>
                    <td className="n">{codeOf(QUESTIONS[2], a.q3)}</td>
                    <td className="n">{codeOf(QUESTIONS[3], a.q4)}</td>
                    <td className="n">{codeOf(QUESTIONS[4], a.q5)}</td>
                    <td className="n">{stops(a)}</td>
                    <td className="n">{codeOf(QUESTIONS[7], a.q8)}</td>
                    <td className="n">{a.q9 ? codeOf(QUESTIONS[8], a.q9.mode) : ''}</td>
                    <td className="star">{star(a) ? '★' : ''}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* 2. Curation Cards (Print-friendly layout) */}
      <div id="cards" className="cards">
        {responses.map((r, i) => {
          const a = r.answers;
          const t = a.q2 || { title: '', why: '' };
          const d = a.q10 || { v: '' };
          const b = a.q9 || { mode: 0, book: '' };

          const isPrioritized = star(a);

          const cells = [
            ['선호하는 분량', a.q3 !== undefined ? QUESTIONS[2]!.opts![a.q3] : '—'],
            ['좋아하는 문장형태', a.q4 !== undefined ? QUESTIONS[3]!.opts![a.q4] : '—'],
            ['선호하는 독서시간', a.q6 !== undefined ? QUESTIONS[5]!.opts![a.q6] : '—'],
            ['멈추게 되는 지점', a.q7 && a.q7.length > 0 ? a.q7.map(idx => QUESTIONS[6]!.opts![idx]).join(' · ') : '—'],
            ['모임에서 원하는 것', a.q8 !== undefined ? QUESTIONS[7]!.opts![a.q8] : '—'],
            ['책과 나의 거리', a.q5 !== undefined ? QUESTIONS[4]!.opts![a.q5] : '—'],
          ];

          return (
            <article className="card" key={r.id}>
              {/* Card Header */}
              <div className="chead">
                <span className="cid">#{String(i + 1).padStart(2, '0')}</span>
                <span className="cname">{r.display_name}</span>
                <span className="cgrp">
                  {r.group_no !== null ? `${r.group_no}조` : '조 미정'}
                </span>
                {isPrioritized && <span className="cflag">우선</span>}
              </div>

              {/* themes */}
              <div className="quote">
                <span className="qlab">끌림</span>
                <div className="v" style={{ fontSize: '14.5px' }}>
                  {themes(a) || '—'}
                </div>
              </div>

              {/* Good Book (Q2) */}
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

              {/* Dropped Book (Q10) */}
              <div className="quote">
                <span className="qlab">덮어둔 책</span>
                {d.v ? (
                  <div className="qtitle" style={{ fontSize: '16px' }}>
                    {d.v}
                  </div>
                ) : (
                  <div className="empty">없음</div>
                )}
              </div>

              {/* Brought Book (Q9 Conditional) */}
              {b.mode === 1 && b.book && (
                <div className="quote" style={{ marginTop: '22px' }}>
                  <span className="qlab">가져올 책</span>
                  <div className="qtitle" style={{ fontSize: '16px' }}>
                    「{b.book}」
                  </div>
                </div>
              )}

              {/* 3x2 Grid cell values */}
              <div className="grid">
                {cells.map(([label, val], idx) => (
                  <div className="cell" key={idx}>
                    <span className="k">{label}</span>
                    <span className="v">{val || '—'}</span>
                  </div>
                ))}
              </div>

              {/* Bottom Curation Handwriting Area */}
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
                  당일 선택 &nbsp;&nbsp; □ 스스로 준비한 책{b.mode === 1 && b.book ? `: ${b.book}` : ''} &nbsp;&nbsp;&nbsp;&nbsp; □ 현장에서 추천받기
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
