'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QUESTIONS, Answers, Question } from '@/lib/questions';
import { submitSurvey } from './actions';

interface SurveyFormProps {
  session: string;
}

export default function SurveyForm({ session }: SurveyFormProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [answers, setAnswers] = useState<Answers>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Check if a dynamic option is disabled for multi-select
  const isMultiDisabled = (qId: string, index: number, max: number) => {
    const arr = (answers[qId as keyof Answers] as number[]) || [];
    return arr.length >= max && !arr.includes(index);
  };

  // 2. Handle click for option (multi-select)
  const handleMultiClick = (qId: string, index: number, max: number) => {
    if (isMultiDisabled(qId, index, max)) return;
    const cur = (answers[qId as keyof Answers] as number[]) || [];
    const at = cur.indexOf(index);
    let updated: number[];
    if (at > -1) {
      updated = cur.filter((i) => i !== index);
    } else {
      updated = [...cur, index];
    }
    setAnswers({ ...answers, [qId]: updated });
  };

  // 3. Handle click for option (single-select)
  const handleSingleClick = (qId: string, index: number) => {
    setAnswers({ ...answers, [qId]: index });
  };

  // 4. Handle click for q9 (book preparation)
  const handleBookClick = (index: number) => {
    setAnswers({
      ...answers,
      q9: {
        mode: index,
        book: answers.q9?.book || '',
      },
    });
  };

  const handleBookTextChange = (text: string) => {
    setAnswers({
      ...answers,
      q9: {
        mode: answers.q9?.mode ?? -1,
        book: text,
      },
    });
  };

  // 5. Calculate completed required questions (total 12 items)
  const getCompletedCount = () => {
    let count = 0;
    if (name.trim() !== '') count++;
    if (phone.trim() !== '') count++;
    if (affiliation.trim() !== '') count++;
    if ((answers.q1?.length ?? 0) > 0) count++;
    if (answers.q2?.title?.trim()) count++;
    if (answers.q3 !== undefined) count++;
    if (answers.q4 !== undefined) count++;
    if (answers.q5 !== undefined) count++;
    if (answers.q6 !== undefined) count++;
    if ((answers.q7?.length ?? 0) > 0) count++;
    if (answers.q8 !== undefined) count++;
    
    if (answers.q9?.mode !== undefined) {
      if (answers.q9.mode === 1) {
        if (answers.q9.book?.trim()) count++;
      } else {
        count++;
      }
    }
    return count;
  };

  const completedCount = getCompletedCount();
  const progressPercent = Math.round((completedCount / 12) * 100);
  const isComplete = completedCount === 12;

  // 6. Handle submit
  const handleSubmit = async () => {
    if (!isComplete) {
      setErrorMsg('모든 필수 문항에 답변해 주세요.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const res = await submitSurvey(session, name, phone, affiliation, answers);
      if (res.success) {
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else {
        setErrorMsg(res.error || '보내지 못했습니다. 다시 시도해 주세요.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('보내지 못했습니다. 네트워크 상황을 확인해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 7. Accessible key handler
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

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
      </div>
    );
  }

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

        {/* 00. Name Field (Required) */}
        <section className="q">
          <span className="qnum">00</span>
          <div className="qtext">그날 불릴 이름을 정해주세요.</div>
          <div className="qhint">
            본명도 좋고, 그날만 쓸 이름을 새로 지으셔도 좋습니다. 명찰과 큐레이션 카드에 이 이름이 적힙니다.
          </div>
          <input
            type="text"
            id="name"
            placeholder="예: 김지연, 목요일, 3번 테이블"
            autoComplete="off"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </section>

        {/* 00-A. Phone Field (Required) */}
        <section className="q">
          <span className="qnum">00-A</span>
          <div className="qtext">신청자 연락처</div>
          <div className="qhint">
            안내 문자 발송 및 예약 확인을 위해 사용되며, 운영진 외에는 절대 노출되지 않습니다.
          </div>
          <input
            type="text"
            id="phone"
            placeholder="010-0000-0000"
            autoComplete="off"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </section>

        {/* 00-B. Affiliation Field (Required) */}
        <section className="q">
          <span className="qnum">00-B</span>
          <div className="qtext">소속</div>
          <div className="qhint">
            회사, 학교, 모임 등 현재 소속되어 있는 조직을 적어주세요.
          </div>
          <input
            type="text"
            id="affiliation"
            placeholder="예: OOO회사 기획팀, 대학생, 무직 등"
            autoComplete="off"
            value={affiliation}
            onChange={(e) => setAffiliation(e.target.value)}
          />
          <div style={{ marginTop: '12px', fontSize: '12.5px', color: 'var(--mark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🔒</span>
            <span>입력하신 연락처와 소속은 운영진의 회원 확인용으로만 사용되며, 다른 참여자나 큐레이션 인쇄 카드에는 절대 공개되지 않고 안전하게 암호화 보관됩니다.</span>
          </div>
        </section>

        {/* Dynamic Questions (01 - 10) */}
        {QUESTIONS.map((q, i) => {
          const num = String(i + 1).padStart(2, '0');
          
          return (
            <section className="q" key={q.id}>
              <span className="qnum">{num}</span>
              <div className="qtext">
                {q.text}
                {q.type === 'multi' && <span className="qmax">{q.max}개까지</span>}
              </div>
              {q.hint && <div className="qhint">{q.hint}</div>}

              {/* Multi Select rendering */}
              {q.type === 'multi' && q.opts && (
                <div className="opts">
                  {q.opts.map((optText, optIdx) => {
                    const isChecked = ((answers[q.id as keyof Answers] as number[]) || []).includes(optIdx);
                    const isDisabled = isMultiDisabled(q.id, optIdx, q.max || 2);
                    const optAction = () => handleMultiClick(q.id, optIdx, q.max || 2);

                    return (
                      <div
                        key={optIdx}
                        className={`opt ${isDisabled ? 'disabled' : ''}`}
                        role="checkbox"
                        aria-checked={isChecked}
                        tabIndex={isDisabled ? -1 : 0}
                        onClick={optAction}
                        onKeyDown={(e) => handleKeyDown(e, optAction)}
                      >
                        <span className="box"></span>
                        <span>{optText}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Single Select rendering */}
              {q.type === 'single' && q.opts && (
                <div className="opts">
                  {q.opts.map((optText, optIdx) => {
                    const isChecked = answers[q.id as keyof Answers] === optIdx;
                    const optAction = () => handleSingleClick(q.id, optIdx);

                    return (
                      <div
                        key={optIdx}
                        className="opt"
                        role="radio"
                        aria-checked={isChecked}
                        tabIndex={0}
                        onClick={optAction}
                        onKeyDown={(e) => handleKeyDown(e, optAction)}
                      >
                        <span className="box"></span>
                        <span>{optText}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Q2 (Title) rendering */}
              {q.type === 'title' && (
                <>
                  <input
                    type="text"
                    placeholder={q.ph}
                    autoComplete="off"
                    value={answers.q2?.title || ''}
                    onChange={(e) =>
                      setAnswers({
                        ...answers,
                        q2: {
                          title: e.target.value,
                          why: answers.q2?.why || '',
                        },
                      })
                    }
                  />
                  <input
                    type="text"
                    placeholder={q.ph2}
                    autoComplete="off"
                    value={answers.q2?.why || ''}
                    onChange={(e) =>
                      setAnswers({
                        ...answers,
                        q2: {
                          title: answers.q2?.title || '',
                          why: e.target.value,
                        },
                      })
                    }
                  />
                </>
              )}

              {/* Q9 (Book prep + Conditional text) rendering */}
              {q.type === 'book' && q.opts && (
                <>
                  <div className="opts">
                    {q.opts.map((optText, optIdx) => {
                      const isChecked = answers.q9?.mode === optIdx;
                      const optAction = () => handleBookClick(optIdx);

                      return (
                        <div
                          key={optIdx}
                          className="opt"
                          role="radio"
                          aria-checked={isChecked}
                          tabIndex={0}
                          onClick={optAction}
                          onKeyDown={(e) => handleKeyDown(e, optAction)}
                        >
                          <span className="box"></span>
                          <span>{optText}</span>
                        </div>
                      );
                    })}
                  </div>
                  {answers.q9?.mode === 1 && (
                    <div className="sub" id="bookIn">
                      <input
                        type="text"
                        placeholder={q.ph}
                        autoComplete="off"
                        value={answers.q9.book || ''}
                        onChange={(e) => handleBookTextChange(e.target.value)}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Q10 (Free text) rendering */}
              {q.type === 'free' && (
                <textarea
                  rows={2}
                  placeholder={q.ph}
                  value={answers.q10?.v || ''}
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      q10: { v: e.target.value },
                    })
                  }
                />
              )}
            </section>
          );
        })}

        <hr className="rule" />

        {/* Payment Info */}
        <div style={{
          background: 'var(--wash)',
          border: '1px solid var(--line)',
          padding: '22px 24px',
          marginBottom: '24px',
          lineHeight: '1.85',
        }}>
          <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '10px', letterSpacing: '.01em' }}>
            참가비용 안내
          </div>
          <ul style={{ paddingLeft: '16px', margin: '0 0 16px 0', fontSize: '13.5px', color: 'var(--mute)' }}>
            <li>참가비용은 <strong style={{ color: 'var(--ink)' }}>20,000원</strong>입니다.</li>
            <li>노쇼 방지 및 모임운영 비용(다과 포함)으로 활용됩니다.</li>
            <li>현장에서 책 구매를 원하실 경우, 당일 서점을 통해 직접 구매하실 수 있습니다.</li>
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

        <button
          className="send"
          disabled={!isComplete || isSubmitting}
          onClick={handleSubmit}
        >
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
