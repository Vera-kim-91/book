const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('Error: Env variables are missing in .env.local');
  process.exit(1);
}

const supabase = createClient(url, anonKey);

async function testFixed() {
  console.log('Testing fixed insert at:', url);
  
  const testSession = `test-${Date.now()}`;
  const dummyRow = {
    session: testSession,
    display_name: '고정-참가자',
    answers: {
      q1: [0, 4],
      q2: { title: '테스트 책', why: '그냥 테스트' },
      q3: 1,
      q4: 2,
      q5: 0,
      q6: 1,
      q7: [5],
      q8: 0,
      q9: { mode: 1, book: '테스트 책' },
      q10: { v: '테스트 중단 책' }
    }
  };

  const { error } = await supabase
    .from('responses')
    .insert([dummyRow]);

  if (error) {
    console.error('Error returned by Supabase for fixed insert:', error);
  } else {
    console.log('Success! Plain insert worked without error!');
  }
}

testFixed();
