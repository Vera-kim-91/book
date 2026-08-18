export interface Question {
  id: string;
  type: 'single' | 'multi' | 'title' | 'book' | 'free';
  text: string;
  hint?: string;
  opts?: string[];
  code?: string[];
  max?: number;
  ph?: string;
  ph2?: string;
}

export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    type: 'multi',
    max: 2,
    text: '읽을 때, 어떤 순간이 좋았나요?',
    opts: [
      '낯선 곳으로 옮겨가는 순간',
      '사람의 속을 들여다보는 순간',
      '세상이 어떻게 굴러가는지 알게 되는 순간',
      '문장이 좋아서 다시 읽게 되는 순간',
      '웃음이 나거나 마음이 가벼워지는 순간',
      '내 일을 다른 각도에서 보게 되는 순간'
    ]
  },
  {
    id: 'q2',
    type: 'title',
    text: '좋았던 책이나 글을 하나만 알려주세요.',
    hint: '책이 아니어도 됩니다. 웹툰, 뉴스레터, 블로그 글, 교과서에 실렸던 지문도 좋습니다.',
    ph: '제목',
    ph2: '어떤 점이 좋았는지 한 줄 (선택)'
  },
  {
    id: 'q3',
    type: 'single',
    text: '손에 들었을 때 부담 없는 두께는 어느 쪽인가요?',
    opts: [
      '150쪽 내외 — 끝이 보이는 정도',
      '250쪽 내외 — 보통 단행본',
      '400쪽이 넘어도 괜찮은 편',
      '두께는 신경 쓰지 않는 편'
    ],
    code: ['150', '250', '400+', '무관']
  },
  {
    id: 'q4',
    type: 'single',
    text: '어떤 문장이 더 편한가요?',
    opts: [
      '짧고 바로 읽히는 문장',
      '길어도 리듬이 좋으면 괜찮은 문장',
      '한 번 더 곱씹게 되는 문장도 좋은 편',
      '잘 모르겠음'
    ],
    code: ['짧음', '리듬', '곱씹음', '모름']
  },
  {
    id: 'q5',
    type: 'single',
    text: '요즘 책과의 거리는 어느 쪽에 가깝나요?',
    opts: [
      '지금 읽고 있는 책이 있음',
      '사두고 아직 펴지 못한 책이 있음',
      '마음은 있는데 손이 안 간 지 좀 됨',
      '책을 읽는 일 자체가 오랜만임'
    ],
    code: ['읽는중', '사둠', '멀어짐', '오랜만']
  },
  {
    id: 'q6',
    type: 'single',
    text: '방해받지 않는다면, 한 번에 어느 정도 읽는 게 편한가요?',
    hint: '그날은 20분간 조용히 읽는 시간이 있습니다.',
    opts: ['5~10분', '20분 정도', '40분 이상도 괜찮음', '요즘은 잘 모르겠음'],
    code: ['5-10분', '20분', '40분+', '모름']
  },
  {
    id: 'q7',
    type: 'multi',
    max: 2,
    text: '읽다가 멈추게 되는 건 주로 어느 지점인가요?',
    opts: [
      '시작 자체가 잘 안 됨',
      '초반 몇 십 쪽을 넘기기 어려움',
      '읽다가 다른 생각이 끼어듦',
      '졸음이 옴',
      '끝까지 읽어야 한다는 부담이 앞섬',
      '무엇을 골라야 할지 몰라 시작을 못 함',
      '특별히 멈추는 지점은 없음'
    ],
    code: ['시작못함', '초반', '딴생각', '졸음', '완독부담', '선택못함', '없음']
  },
  {
    id: 'q8',
    type: 'single',
    text: '그날, 어떤 시간이 되면 좋겠나요?',
    opts: [
      '조용히 가라앉는 시간',
      '잠깐 다른 곳으로 옮겨가는 시간',
      '가볍게 웃는 시간',
      '생각이 움직이는 시간',
      '아직 모르겠음'
    ],
    code: ['가라앉기', '옮겨가기', '웃기', '자극', '모름']
  },
  {
    id: 'q9',
    type: 'book',
    text: '당일 읽을 책은 어떻게 하시겠어요?',
    opts: ['서점에서 준비해주시면 좋겠음', '가져갈 책이 있음', '아직 정하지 못함'],
    code: ['요청', '지참', '미정'],
    ph: '어떤 책인지 알려주세요'
  },
  {
    id: 'q10',
    type: 'free',
    text: '최근에 읽다가 덮어둔 책이 있나요?',
    hint: '없어도 괜찮습니다.',
    ph: '제목, 어디쯤에서 멈췄는지'
  }
];

export interface Answers {
  q1?: number[];
  q2?: { title: string; why: string };
  q3?: number;
  q4?: number;
  q5?: number;
  q6?: number;
  q7?: number[];
  q8?: number;
  q9?: { mode: number; book: string };
  q10?: { v: string };
}

export interface CurationResponse {
  id: string;
  session: string;
  display_name: string;
  answers: Answers;
  group_no: number | null;
  created_at: string;
}

export const codeOf = (question: Question, val?: number): string => {
  if (!question.code || val === undefined || val === null) return '';
  return question.code[val] || '';
};

export const themes = (answers: Answers): string => {
  const q1 = QUESTIONS.find((q) => q.id === 'q1');
  if (!q1 || !q1.opts || !answers.q1) return '';
  return answers.q1
    .map((i) => (q1.opts ? q1.opts[i].replace(/ 순간$/, '') : ''))
    .join(' · ');
};

export const stops = (answers: Answers): string => {
  const q7 = QUESTIONS.find((q) => q.id === 'q7');
  if (!q7 || !q7.code || !answers.q7) return '';
  return answers.q7.map((i) => (q7.code ? q7.code[i] : '')).join(' · ');
};

export const star = (answers: Answers): boolean => {
  // q7 index 5 is '선택못함'
  return !!(answers.q7 && answers.q7.includes(5));
};
