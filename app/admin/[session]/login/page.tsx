'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdmin } from './actions';

interface PageProps {
  params: Promise<{
    session: string;
  }>;
}

export default function LoginPage({ params }: PageProps) {
  const { session } = use(params);
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await loginAdmin(password);
      if (res.success) {
        // Redirect back to admin dashboard
        router.push(`/admin/${encodeURIComponent(session)}`);
        router.refresh();
      } else {
        setErrorMsg(res.error || '로그인에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="wrap" style={{ textAlign: 'center', paddingTop: '100px' }}>
      <div className="mark">O . O . O &nbsp; ADMIN</div>
      <div className="lede">운영자 로그인</div>
      <p className="note" style={{ marginBottom: '30px' }}>
        회차 세션: <b>{decodeURIComponent(session)}</b>
      </p>
      
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="관리자 비밀번호 입력"
          style={{
            textAlign: 'center',
            fontSize: '16px',
            marginBottom: '20px',
            border: '0',
            borderBottom: '2px solid var(--line)',
            padding: '9px 2px',
            width: '100%',
            background: 'transparent',
            outline: 'none',
          }}
          required
          autoFocus
        />
        <button type="submit" className="send" disabled={isSubmitting}>
          {isSubmitting ? '로그인 중...' : '로그인'}
        </button>
      </form>
      {errorMsg && <div className="msg" style={{ color: 'red' }}>{errorMsg}</div>}
    </div>
  );
}
