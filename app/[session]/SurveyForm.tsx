'use client';

import { useState } from 'react';
import { QUESTIONS, GENRES, Answers } from '@/lib/questions';
import { submitSurvey } from './actions';

interface SurveyFormProps {
  session: string;
}

export default function SurveyForm({ session }: SurveyFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [answers, setAnswers] = useState<Answers>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  /* ── helpers ── */
  const isMultiDisabled = (qId: string, index: number, max: number) => {
    const arr = (answers[qId as keyof Answers] as number[]) || [];
    return arr.length >= max && !arr.includes(index);
  };

  const handleMultiClick = (qId: string, index: number, max: number) => {
    if (isMultiDisabled(qId, index, max)) return;
    const cur = (answers[qId as keyof Answers] as number[]) || [];
    const at = cur.indexOf(index);
    const updated = at > -1 ? cur.filter((i) => i !== index) : [...cur, index];
    setAnswers({ ...answers, [qId]: updated });
  };

  const handleSingleClick = (qId: string, index: number) => {
    setAnswers({ ...answers, [qId]: index });
  };

  /* ── q3 장르 ── */
  const handleGenreLike = (index: number) => {
    const cur = answers.q3?.like ?? [];
    const avoid = answers.q3?.avoid ?? null;
    const alreadyIn = cur.includes(index);
    if (!alreadyIn && cur.length >= 3) return;
    const like = alreadyIn ? cur.filter((i) => i !== index) : [...cur, index];
    // avoid가 같은 항목이면 해제
    const newAvoid = avoid === index ? null : avoid;
    setAnswers({ ...answers, q3: { like, avoid: newAvoid } });
  };

  const handleGenreAvoid = (index: number | null) => {
    const like = answers.q3?.like ?? [];
    setAnswers({ ...answers, q3: { like, avoid: index } });
  };

  /* ── q10 도서 준비 ── */
  const handleBookClick = (index: number) => {
    setAnswers({ ...answers, q10: { mode: index, book: answers.q10?.book ?? '' } });
  };
  const handleBookText = (text: string) => {
    setAnswers({ ...answers, q10: { mode: answers.q10?.mode ?? -1, book: text } });
  };

  /* ── q11 덮어둔 것 ── */
  const handleFree = (val: string) => {
    setAnswers({ ...answers, q11: { v: val } });
  };

  /* ── 진행률 (필수 11항목 + name + phone + affiliation = 14) ── */
  const getCompletedCount = () => {
    let c = 0;
    if (name.trim()) c++;
    if (phone.trim()) c++;
    if (affiliation.trim()) c++;
    if ((answers.q1?.length ?? 0) > 0) c++;
    if (answers.q2?.title?.trim()) c++;
    if ((answers.q3?.like?.length ?? 0) > 0) c++;   // q3 like 필수
    if (answers.q4 !== undefined) c++;
    if (answers.q5 !== undefined) c++;
    if (answers.q6 !== undefined) c++;
    if (answers.q7 !== undefined) c++;
    if ((answers.q8?.length ?? 0) > 0) c++;
    if (answers.q9 !== undefined) c++;
    // q10
    if (answers.q10?.mode !== undefined) {
      if (answers.q10.mode === 1) { if (answers.q10.book?.trim()) c++; }
      else c++;
    }
    // q11 선택 — 진행률에서 제외
    return c;
  };

  const TOTAL = 13; // name+phone+affiliation + q1~q10(필수)
  const completedCount = getCompletedCount();
  const progressPercent = Math.min(Math.round((completedCount / TOTAL) * 100), 100);
  const isComplete = completedCount >= TOTAL;

  /* ── 제출 ── */
  const handleSubmit = async () => {
    if (!isComplete) { setErrorMsg('모든 필수 문항에 답변해 주세요.'); return; }
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const res = await submitSurvey(session, name, phone, affiliation, answers);
      if (res.success) {
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else {
        setErrorMsg(res.error ?? '보내지 못했습니다. 다시 시도해 주세요.');
      }
    } catch {
      setErrorMsg('보내지 못했습니다. 네트워크 상황을 확인해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); action(); }
  };

  /* ── 완료 화면 ── */
  if (isSubmitted) {
    return (
      <div className="wrap done">
        <div className="mark">O . O . O &nbsp;OUT OF OFFICE</div>
        <div className="lede">{name} 님, 잘 받았습니다.</div>
        <p className="note">
          적어주신 내용은 파트너 서점의 큐레이터에게 전달됩니다.<br />
          그날 두 권 정도를 준비해두고, 그중에서 직접 고르시게 됩니다.<br /><br />
          당일 명찰에는 이 이름이 적힙니다.<br />
          휴대폰을 봉투에 맡기고 들어오시면 됩니다.
        </p>
        <p style={{
          marginTop: '36px',
          fontFamily: 'var(--serif)',
          fontSize: '15px',
          color: 'var(--mark)',
          lineHeight: '1.8',
          letterSpacing: '.01em',
        }}>
          당신과 책이 더 가까워지는 시간,<br />
          off book에서 만나요.
        </p>
      </div>
    );
  }

  /* ── 설문 화면 ── */
  return (
    <>
      <div className="prog noprint">
        <i style={{ width: `${progressPercent}%` }}></i>
      </div>
      <div className="wrap">
        <div className="mark">O . O . O &nbsp;OUT OF OFFICE</div>
        <div className="lede">읽기 전에,<br />몇 가지만 여쭙습니다.</div>
        <p className="note">
          평가하는 설문이 아닙니다. 그날 어떤 책을 준비해둘지, 어떤 분들과 한 조가 될지를 정하기 위한 것입니다.<br />
          요즘 책과 멀어져 있어도 괜찮습니다. <b>3분이면 끝납니다.</b>
        </p>
        <hr className="rule" />

        {/* 00. 이름 */}
        <section className="q">
          <span className="qnum">00</span>
          <div className="qtext">그날 불릴 이름을 정해주세요.</div>
          <div className="qhint">본명도 좋고, 그날만 쓸 이름을 새로 지으셔도 좋습니다. 명찰과 큐레이션 카드에 이 이름이 적힙니다.</div>
          <input type="text" placeholder="예: 김지연, 목요일, 3번 테이블" autoComplete="off" value={name} onChange={(e) => setName(e.target.value)} />
        </section>

        {/* 00-A. 연락처 */}
        <section className="q">
          <span className="qnum">00-A</span>
          <div className="qtext">신청자 연락처</div>
          <div className="qhint">안내 문자 발송 및 예약 확인을 위해 사용되며, 운영진 외에는 절대 노출되지 않습니다.</div>
          <input type="text" placeholder="010-0000-0000" autoComplete="off" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </section>

        {/* 00-B. 소속 */}
        <section className="q">
          <span className="qnum">00-B</span>
          <div className="qtext">소속</div>
          <div className="qhint">회사, 학교, 모임 등 현재 소속되어 있는 조직을 적어주세요.</div>
          <input type="text" placeholder="예: OOO회사 기획팀, 대학생, 무직 등" autoComplete="off" value={affiliation} onChange={(e) => setAffiliation(e.target.value)} />
          <div style={{ marginTop: '12px', fontSize: '12.5px', color: 'var(--mark)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
            <span>🔒</span>
            <span>입력하신 연락처와 소속은 운영진의 회원 확인용으로만 사용되며, 다른 참여자나 큐레이션 인쇄 카드에는 절대 공개되지 않습니다.</span>
          </div>
        </section>

        {/* 01 ~ 11 동적 문항 */}
        {QUESTIONS.map((q, i) => {
          const num = String(i + 1).padStart(2, '0');

          /* ── q3 장르 전용 UI ── */
          if (q.kind === 'genre') {
            const likeList = answers.q3?.like ?? [];
            const avoidVal = answers.q3?.avoid ?? null;
            const AVOID_NONE = 8; // 특별히 없음 idx
            return (
              <section className="q" key={q.id}>
                <span className="qnum">{num}</span>
                <div className="qtext">
                  {q.text}
                  <span className="qmax">3개까지</span>
                </div>
                <div className="opts">
                  {GENRES.map((g, idx) => {
                    const checked = likeList.includes(idx);
                    const disabled = !checked && likeList.length >= q.max;
                    return (
                      <div
                        key={idx}
                        className={`opt${disabled ? ' disabled' : ''}`}
                        role="checkbox"
                        aria-checked={checked}
                        tabIndex={disabled ? -1 : 0}
                        onClick={() => !disabled && handleGenreLike(idx)}
                        onKeyDown={(e) => handleKeyDown(e, () => !disabled && handleGenreLike(idx))}
                      >
                        <span className="box" />
                        {g}
                      </div>
                    );
                  })}
                </div>

                {/* avoid */}
                <div style={{ marginTop: '32px' }}>
                  <div className="qtext" style={{ fontSize: '15px' }}>{q.text2} <span className="qmax">선택</span></div>
                  <div className="opts">
                    {GENRES.map((g, idx) => {
                      const isLiked = likeList.includes(idx);
                      const checked = avoidVal === idx;
                      return (
                        <div
                          key={idx}
                          className={`opt${isLiked ? ' disabled' : ''}`}
                          role="radio"
                          aria-checked={checked}
                          tabIndex={isLiked ? -1 : 0}
                          onClick={() => { if (!isLiked) handleGenreAvoid(checked ? null : idx); }}
                          onKeyDown={(e) => handleKeyDown(e, () => { if (!isLiked) handleGenreAvoid(checked ? null : idx); })}
                        >
                          <span className="box" />
                          {g}
                        </div>
                      );
                    })}
                    {/* 특별히 없음 */}
                    <div
                      className="opt"
                      role="radio"
                      aria-checked={avoidVal === AVOID_NONE}
                      tabIndex={0}
                      onClick={() => handleGenreAvoid(avoidVal === AVOID_NONE ? null : AVOID_NONE)}
                      onKeyDown={(e) => handleKeyDown(e, () => handleGenreAvoid(avoidVal === AVOID_NONE ? null : AVOID_NONE))}
                    >
                      <span className="box" />
                      특별히 없음
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          /* ── q10 도서 준비 ── */
          if (q.kind === 'book' && 'opts' in q && q.opts) {
            const mode = answers.q10?.mode;
            return (
              <section className="q" key={q.id}>
                <span className="qnum">{num}</span>
                <div className="qtext">{q.text}</div>
                <div className="opts">
                  {q.opts.map((opt, idx) => (
                    <div
                      key={idx}
                      className="opt"
                      role="radio"
                      aria-checked={mode === idx}
                      tabIndex={0}
                      onClick={() => handleBookClick(idx)}
                      onKeyDown={(e) => handleKeyDown(e, () => handleBookClick(idx))}
                    >
                      <span className="box" />
                      {opt}
                    </div>
                  ))}
                </div>
                {mode === 1 && (
                  <div className="sub">
                    <input
                      type="text"
                      placeholder={'ph' in q ? q.ph : ''}
                      value={answers.q10?.book ?? ''}
                      onChange={(e) => handleBookText(e.target.value)}
                    />
                  </div>
                )}
              </section>
            );
          }

          /* ── q11 자유서술 (선택) ── */
          if (q.kind === 'free') {
            return (
              <section className="q" key={q.id}>
                <span className="qnum">{num}</span>
                <div className="qtext">{q.text}</div>
                {q.hint && <div className="qhint">{q.hint}</div>}
                <input
                  type="text"
                  placeholder={'ph' in q ? q.ph : ''}
                  value={answers.q11?.v ?? ''}
                  onChange={(e) => handleFree(e.target.value)}
                />
              </section>
            );
          }

          /* ── title (q2) ── */
          if (q.kind === 'title') {
            return (
              <section className="q" key={q.id}>
                <span className="qnum">{num}</span>
                <div className="qtext">{q.text}</div>
                {q.hint && <div className="qhint">{q.hint}</div>}
                <input
                  type="text"
                  placeholder={'ph' in q ? q.ph : ''}
                  value={answers.q2?.title ?? ''}
                  onChange={(e) => setAnswers({ ...answers, q2: { title: e.target.value, why: answers.q2?.why ?? '' } })}
                />
                {'ph2' in q && q.ph2 && (
                  <input
                    type="text"
                    placeholder={q.ph2}
                    value={answers.q2?.why ?? ''}
                    style={{ marginTop: '8px' }}
                    onChange={(e) => setAnswers({ ...answers, q2: { title: answers.q2?.title ?? '', why: e.target.value } })}
                  />
                )}
              </section>
            );
          }

          /* ── multi (q1, q8) ── */
          if (q.kind === 'multi' && 'opts' in q && q.opts) {
            const cur = (answers[q.id as keyof Answers] as number[]) ?? [];
            return (
              <section className="q" key={q.id}>
                <span className="qnum">{num}</span>
                <div className="qtext">
                  {q.text}
                  {q.max && <span className="qmax">{q.max}개까지</span>}
                </div>
                {q.hint && <div className="qhint">{q.hint}</div>}
                <div className="opts">
                  {q.opts.map((opt, idx) => {
                    const checked = cur.includes(idx);
                    const disabled = !checked && cur.length >= (q.max ?? 99);
                    return (
                      <div
                        key={idx}
                        className={`opt${disabled ? ' disabled' : ''}`}
                        role="checkbox"
                        aria-checked={checked}
                        tabIndex={disabled ? -1 : 0}
                        onClick={() => handleMultiClick(q.id, idx, q.max ?? 99)}
                        onKeyDown={(e) => handleKeyDown(e, () => handleMultiClick(q.id, idx, q.max ?? 99))}
                      >
                        <span className="box" />
                        {opt}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          /* ── single (q4, q5, q6, q7, q9) ── */
          if (q.kind === 'single' && 'opts' in q && q.opts) {
            const cur = answers[q.id as keyof Answers] as number | undefined;
            return (
              <section className="q" key={q.id}>
                <span className="qnum">{num}</span>
                <div className="qtext">{q.text}</div>
                {q.hint && <div className="qhint">{q.hint}</div>}
                <div className="opts">
                  {q.opts.map((opt, idx) => (
                    <div
                      key={idx}
                      className="opt"
                      role="radio"
                      aria-checked={cur === idx}
                      tabIndex={0}
                      onClick={() => handleSingleClick(q.id, idx)}
                      onKeyDown={(e) => handleKeyDown(e, () => handleSingleClick(q.id, idx))}
                    >
                      <span className="box" />
                      {opt}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          return null;
        })}

        <hr className="rule" />

        {/* 참가비 안내 */}
        <div style={{ background: 'var(--wash)', border: '1px solid var(--line)', padding: '22px 24px', marginBottom: '24px', lineHeight: '1.85' }}>
          <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '10px', letterSpacing: '.01em' }}>참가비용 안내</div>
          <ul style={{ paddingLeft: '16px', margin: '0 0 16px 0', fontSize: '13.5px', color: 'var(--mute)', lineHeight: '1.9' }}>
            <li>참가비용은 <strong style={{ color: 'var(--ink)' }}>20,000원</strong>입니다.</li>
            <li>노쇼 방지 및 모임운영과 교육진행비로 활용됩니다.</li>
            <li>참가비용에 <strong style={{ color: 'var(--ink)' }}>1만원 책 크레딧</strong>이 포함되어 있습니다. 서점에서 책을 구매하실 때 사용하실 수 있습니다.</li>
            <li>큐레이팅 받으신 책을 구매하고 싶으시다면 현장에서 말씀해 주세요.</li>
          </ul>
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: '14px', fontSize: '13.5px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'baseline' }}>
              <span style={{ color: 'var(--faint)', fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '.1em', minWidth: '72px' }}>참가비용</span>
              <strong style={{ fontSize: '15px' }}>20,000원</strong>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'baseline' }}>
              <span style={{ color: 'var(--faint)', fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '.1em', minWidth: '72px' }}>입금계좌</span>
              <span>김희진 &nbsp;<strong>1002-954-726035</strong> &nbsp;<span style={{ color: 'var(--mute)', fontSize: '12.5px' }}>(우리은행)</span></span>
            </div>
          </div>
        </div>

        <button className="send" disabled={!isComplete || isSubmitting} onClick={handleSubmit}>
          {isSubmitting ? '보내는 중…' : '보내기'}
        </button>
        {errorMsg && <div className="msg">{errorMsg}</div>}

        <div style={{ marginTop: '40px', fontSize: '12.5px', color: 'var(--mute)', lineHeight: '1.6' }}>
          <strong>개인정보 수집 및 이용 고지</strong>
          <ul style={{ paddingLeft: '16px', margin: '6px 0 0 0' }}>
            <li>수집 항목: 그날 불릴 이름, 사전 진단 응답 데이터</li>
            <li>수집 목적: 독서 소모임 도서 큐레이션 및 조 편성</li>
            <li>보유 및 이용 기간: <strong>본 프로그램 종료 후 90일</strong> (기간 만료 시 데이터는 즉시 영구 파기됩니다.)</li>
          </ul>
        </div>
      </div>
    </>
  );
}
