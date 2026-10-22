// Mock data & TypeScript interfaces for FlashLearn TH
// Curriculum reference: ม.ปลาย (Thai High School, M.4-M.6)
// Phase 4 content: Physics (Motion) + Math (Sets)

export type SubjectId = 'physics' | 'math';

export interface Subject {
  id: SubjectId;
  name: string;
  nameEn: string;
  icon: string;
  color: string;
  description: string;
}

export interface Topic {
  id: string;
  subjectId: SubjectId;
  name: string;
  nameEn: string;
  description: string;
  level: 'ม.4' | 'ม.5' | 'ม.6';
  estMinutes: number;
}

export interface Flashcard {
  id: string;
  topicId: string;
  front: string;
  back: string;
  hint?: string;
  formula?: string;
}

export interface QuizQuestion {
  id: string;
  topicId: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  exp: number;
}

// ---------------------------------------------------------------------------
// Subjects
// ---------------------------------------------------------------------------

export const subjects: Subject[] = [
  {
    id: 'physics',
    name: 'ฟิสิกส์',
    nameEn: 'Physics',
    icon: 'Atom',
    color: 'from-sky-500 to-indigo-600',
    description: 'การเคลื่อนที่แนวตรง ความเร็วสัมพัทธ์',
  },
  {
    id: 'math',
    name: 'คณิตศาสตร์',
    nameEn: 'Math',
    icon: 'Sigma',
    color: 'from-amber-500 to-orange-600',
    description: 'เซต สับเซต เพาเวอร์เซต',
  },
];

// ---------------------------------------------------------------------------
// Topics
// ---------------------------------------------------------------------------

export const topics: Topic[] = [
  {
    id: 'phy-motion',
    subjectId: 'physics',
    name: 'การเคลื่อนที่แนวตรงและความเร็วสัมพัทธ์',
    nameEn: 'Linear Motion & Relative Velocity',
    description: 'ปริมาณสเกลาร์และเวกเตอร์ สมการการเคลื่อนที่ ความเร็วสัมพัทธ์',
    level: 'ม.4',
    estMinutes: 15,
  },
  {
    id: 'math-sets',
    subjectId: 'math',
    name: 'เซต สับเซต และเพาเวอร์เซต',
    nameEn: 'Sets, Subsets & Power Sets',
    description: 'สัญลักษณ์เซต สับเซต เพาเวอร์เซต และพีชคณิตเซต',
    level: 'ม.4',
    estMinutes: 12,
  },
];

// ---------------------------------------------------------------------------
// Flashcards — Physics: Linear Motion & Relative Velocity
// ---------------------------------------------------------------------------

export const flashcards: Flashcard[] = [
  {
    id: 'fc-phy-1',
    topicId: 'phy-motion',
    front: 'ปริมาณสเกลาร์ (Scalar) ต่างจากปริมาณเวกเตอร์ (Vector) อย่างไร?',
    back: 'สเกลารีมีแต่ขนาด เช่น ระยะทาง (s) ความเร็ว (v) เวกเตอร์มีทั้งขนาดและทิศ เช่น การกระจัด (s⃗) ความเร็ว (v⃗) ความเร่ง (a⃗)',
    hint: 'สเกลาร = ขนาดอย่างเดียว · เวกเตอร์ = ขนาด + ทิศ',
    formula: 's⃗, v⃗, a⃗ (เวกเตอร์)  vs  s, v, a (สเกลาร์)',
  },
  {
    id: 'fc-phy-2',
    topicId: 'phy-motion',
    front: 'สูตรความเร็วคงตัว (ไม่มีความเร่ง) คืออะไร?',
    back: 'เมื่อวัตถุเคลื่อนที่ด้วยความเร็วคงตัว ความเร็วเท่ากับการกระจัดหารด้วยเวลา',
    hint: 'v = s / t',
    formula: 'v⃗ = s⃗ / t',
  },
  {
    id: 'fc-phy-3',
    topicId: 'phy-motion',
    front: 'สมการการเคลื่อนที่ด้วยความเร่งคงตัว (5 สูตร) คืออะไร?',
    back: 'เมื่อความเร่งคงตัว ใช้สมการเชิงเส้น 5 สูตรเพื่อหา v, u, a, s, t',
    hint: 'จำให้ครบ 5 สูตร',
    formula: 'v = u + at  ·  s = ½(u + v)t  ·  s = ut + ½at²  ·  s = vt − ½at²  ·  v² = u² + 2as',
  },
  {
    id: 'fc-phy-4',
    topicId: 'phy-motion',
    front: 'ความเร็วสัมพัทธ์ (Relative Velocity) คืออะไร?',
    back: 'ความเร็วของวัตถุ A เทียบกับวัตถุ B เท่ากับความเร็วของ A ลบด้วยความเร็วของ B (เป็นปริมาณเวกเตอร์ ต้องลบเป็นเวกเตอร์)',
    hint: 'v_A/B = v_A − v_B',
    formula: 'v⃗_A/B = v⃗_A − v⃗_B',
  },
  // Math: Sets, Subsets & Power Sets
  {
    id: 'fc-math-1',
    topicId: 'math-sets',
    front: 'สัญลักษณ์ทางเซตที่จำเป็นคืออะไร?',
    back: '∈ แปลว่า "เป็นสมาชิกของ" · ∅ แปลว่าเซตว่าง (ไม่มีสมาชิก) · ⊂ แปลว่า "เป็นสับเซตของ"',
    hint: '∈ = สมาชิก · ∅ = เซตว่าง · ⊂ = สับเซต',
    formula: 'x ∈ A,  ∅ = { },  A ⊂ B',
  },
  {
    id: 'fc-math-2',
    topicId: 'math-sets',
    front: 'ถ้าเซต A มีสมาชิก n ตัว จะมีสับเซต (Subset) ทั้งหมดกี่เซต?',
    back: 'จำนวนสับเซตทั้งหมดเท่ากับ 2 ยกกำลัง n รวมถึงเซตว่างและตัวมันเองด้วย',
    hint: '2 ยกกำลังจำนวนสมาชิก',
    formula: 'จำนวนสับเซต = 2ⁿ',
  },
  {
    id: 'fc-math-3',
    topicId: 'math-sets',
    front: 'เพาเวอร์เซต P(A) คืออะไร?',
    back: 'เพาเวอร์เซตคือเซตที่สมาชิกเป็นสับเซตทั้งหมดของ A รวมทั้งเซตว่างด้วย เช่น A = {1} → P(A) = {∅, {1}}',
    hint: 'เซตของสับเซตทั้งหมด',
    formula: 'P(A) = { S | S ⊂ A }  ·  ∅ ∈ P(A)',
  },
  {
    id: 'fc-math-4',
    topicId: 'math-sets',
    front: 'กฎพีชคณิตเซตที่สำคัญมีอะไรบ้าง?',
    back: 'กฎสลับที่ A∪B = B∪A · กฎเดอมอร์แกน (A∪B)′ = A′∩B′ · ผลต่าง A−B = A∩B′',
    hint: 'สลับที่ · เดอมอร์แกน · ผลต่าง',
    formula: 'A∪B = B∪A  ·  (A∪B)′ = A′∩B′  ·  (A∩B)′ = A′∪B′  ·  A−B = A∩B′',
  },
];

// ---------------------------------------------------------------------------
// Quiz questions
// ---------------------------------------------------------------------------

export const quizQuestions: QuizQuestion[] = [
  // Physics — Linear Motion & Relative Velocity
  {
    id: 'q-phy-1',
    topicId: 'phy-motion',
    question: 'วัตถุเริ่มจากหยุดนิ่ง (u = 0) เคลื่อนที่ด้วยความเร่ง a = 2 m/s² เป็นเวลา 3 วินาที มีความเร็วสุดท้ายเท่าใด?',
    choices: ['4 m/s', '6 m/s', '9 m/s', '12 m/s'],
    correctIndex: 1,
    explanation: 'ใช้สูตร v = u + at = 0 + (2)(3) = 6 m/s',
  },
  {
    id: 'q-phy-2',
    topicId: 'phy-motion',
    question: 'รถ A วิ่งด้วยความเร็ว 30 m/s รถ B วิ่งทิศเดียวกันด้วยความเร็ว 10 m/s ความเร็วของ A เทียบกับ B เท่ากับเท่าใด?',
    choices: ['10 m/s', '20 m/s', '40 m/s', '15 m/s'],
    correctIndex: 1,
    explanation: 'v_A/B = v_A − v_B = 30 − 10 = 20 m/s',
  },
  {
    id: 'q-phy-3',
    topicId: 'phy-motion',
    question: 'วัตถุมีความเร็วต้น u = 4 m/s เคลื่อนที่ด้วยความเร่ง a = 2 m/s² ระยะทางที่เคลื่อนที่ในเวลา 3 วินาทีเป็นเท่าใด?',
    choices: ['15 m', '18 m', '21 m', '24 m'],
    correctIndex: 2,
    explanation: 's = ut + ½at² = (4)(3) + ½(2)(9) = 12 + 9 = 21 m',
  },
  // Math — Sets, Subsets & Power Sets
  {
    id: 'q-math-1',
    topicId: 'math-sets',
    question: 'เซต A = {1, 2, 3} มีสับเซตทั้งหมดกี่เซต?',
    choices: ['3 เซต', '6 เซต', '8 เซต', '9 เซต'],
    correctIndex: 2,
    explanation: 'จำนวนสมาชิก n = 3 → จำนวนสับเซต = 2³ = 8 เซต',
  },
  {
    id: 'q-math-2',
    topicId: 'math-sets',
    question: 'เพาเวอร์เซตของเซตว่าง P(∅) คืออะไร?',
    choices: ['∅', '{∅}', '{∅, {∅}}', 'ไม่นิยาม'],
    correctIndex: 1,
    explanation: 'เซตว่างมีสับเซตเพียงเซตเดียวคือตัวมันเอง → P(∅) = {∅}',
  },
  {
    id: 'q-math-3',
    topicId: 'math-sets',
    question: 'ผลต่าง A − B เขียนในรูปของอินเตอร์เซกต์ได้อย่างไร?',
    choices: ['A ∩ B', 'A ∪ B′', 'A ∩ B′', 'A′ ∩ B'],
    correctIndex: 2,
    explanation: 'ผลต่าง A − B คือสมาชิกที่อยู่ใน A แต่ไม่อยู่ใน B → A − B = A ∩ B′',
  },
];

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------

export const badges: Badge[] = [
  {
    id: 'badge-motion-master',
    name: 'Motion Master',
    description: 'ทำแบบทดสอบการเคลื่อนที่แนวตรงครบทุกข้อถูก',
    icon: 'Trophy',
    exp: 50,
  },
  {
    id: 'badge-set-master',
    name: 'Set Master',
    description: 'ทำแบบทดสอบเซตครบทุกข้อถูก',
    icon: 'Sigma',
    exp: 50,
  },
  {
    id: 'badge-quick-learner',
    name: 'Quick Learner',
    description: 'ทบทวนการ์ดความจำครบทุกใบภายในเวลา 5 นาที',
    icon: 'Zap',
    exp: 30,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getSubject(id: SubjectId): Subject | undefined {
  return subjects.find((s) => s.id === id);
}

export function getTopicsBySubject(subjectId: SubjectId): Topic[] {
  return topics.filter((t) => t.subjectId === subjectId);
}

export function getFlashcardsByTopic(topicId: string): Flashcard[] {
  return flashcards.filter((f) => f.topicId === topicId);
}

export function getQuizByTopic(topicId: string): QuizQuestion[] {
  return quizQuestions.filter((q) => q.topicId === topicId);
}
