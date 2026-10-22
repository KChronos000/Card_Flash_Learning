// LocalStorage-backed anonymous results store.
// No names or personal identifiers — only grade level, scores, and timing.

export type GradeLevel = 'ม.4' | 'ม.5' | 'ม.6';

export interface TestResult {
  id: string;
  grade: GradeLevel;
  topicId: string;
  topicName: string;
  subjectId: string;
  preScore: number;
  postScore: number;
  totalQuestions: number;
  durationSec: number;
  improvementPct: number; // post - pre as a percentage of total
  completedAt: string; // ISO
}

const KEY = 'flashlearn_results_v1';
const EVENT = 'flashlearn_results_updated';

function readAll(): TestResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(results: TestResult[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(results));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function getAllResults(): TestResult[] {
  return readAll();
}

export function saveResult(result: Omit<TestResult, 'id' | 'completedAt'>): TestResult {
  const full: TestResult = {
    ...result,
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `r-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    completedAt: new Date().toISOString(),
  };
  const all = readAll();
  all.push(full);
  writeAll(all);
  return full;
}

export function clearResults() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent('flashlearn_results_updated'));
}

// Aggregations used by the analytics dashboard.

export interface GradeAgg {
  grade: GradeLevel;
  count: number;
  avgPre: number;
  avgPost: number;
  avgImprovementPct: number;
}

export function aggregateByGrade(results: TestResult[]): GradeAgg[] {
  const grades: GradeLevel[] = ['ม.4', 'ม.5', 'ม.6'];
  return grades.map((grade) => {
    const rs = results.filter((r) => r.grade === grade);
    const count = rs.length;
    const avgPre = count ? rs.reduce((s, r) => s + r.preScore, 0) / count : 0;
    const avgPost = count ? rs.reduce((s, r) => s + r.postScore, 0) / count : 0;
    const avgImprovementPct = count
      ? rs.reduce((s, r) => s + r.improvementPct, 0) / count
      : 0;
    return { grade, count, avgPre, avgPost, avgImprovementPct };
  });
}

export function overallStats(results: TestResult[]) {
  const count = results.length;
  const avgPre = count ? results.reduce((s, r) => s + r.preScore, 0) / count : 0;
  const avgPost = count ? results.reduce((s, r) => s + r.postScore, 0) / count : 0;
  const avgImprovementPct = count
    ? results.reduce((s, r) => s + r.improvementPct, 0) / count
    : 0;
  const avgDurationSec = count
    ? results.reduce((s, r) => s + r.durationSec, 0) / count
    : 0;
  return { count, avgPre, avgPost, avgImprovementPct, avgDurationSec };
}
