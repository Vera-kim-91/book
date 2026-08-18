'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [session, setSession] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (session.trim()) {
      router.push(`/${encodeURIComponent(session.trim())}`);
    }
  };

  return (
    <div className="wrap" style={{ textAlign: 'center', paddingTop: '100px' }}>
      <div className="mark">O . O . O &nbsp; OUT OF OFFICE</div>
      <div className="lede">독서 소모임 사전 읽기 진단</div>
      <p className="note" style={{ marginBottom: '30px' }}>
        전달받은 세션 링크로 접속하시거나, 세션 이름을 아래에 입력하여 진행해주세요.
      </p>
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
        <input
          type="text"
          value={session}
          onChange={(e) => setSession(e.target.value)}
          placeholder="예: 2026-09-11-mokdong"
          style={{
            textAlign: 'center',
            fontSize: '16px',
            marginBottom: '20px',
            borderBottom: '2px solid var(--line)',
          }}
          required
        />
        <button type="submit" className="send">
          진단 시작하기
        </button>
      </form>
    </div>
  );
}
