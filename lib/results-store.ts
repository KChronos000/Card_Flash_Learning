import { supabase } from './supabase';

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
  improvementPct: number; 
  completedAt: string; 
}

// แปลง snake_case (DB) -> camelCase (app)
function fromRow(r: any): TestResult {
  return {
    id: r.id,
    grade: r.grade,
    topicId: r.topic_id,
    topicName: r.topic_name,
    subjectId: r.subject_id,
    preScore: r.pre_score,
    postScore: r.post_score,
    totalQuestions: r.total_questions,
    durationSec: r.duration_sec,
    improvementPct: Number(r.improvement_pct),
    completedAt: r.completed_at,
  };
}

export async function getAllResults(): Promise<TestResult[]> {
  const { data, error } = await supabase
    .from('test_results')
    .select('*')
    .order('completed_at', { ascending: false });
  if (error) {
    console.error(error);
    return [];
  }
  return (data ?? []).map(fromRow);
}

export async function saveResult(
  result: Omit<TestResult, 'id' | 'completedAt'>
): Promise<TestResult | null> {
  const { data, error } = await supabase
    .from('test_results')
    .insert({
      grade: result.grade,
      topic_id: result.topicId,
      topic_name: result.topicName,
      subject_id: result.subjectId,
      pre_score: result.preScore,
      post_score: result.postScore,
      total_questions: result.totalQuestions,
      duration_sec: result.durationSec,
      improvement_pct: result.improvementPct,
    })
    .select()
    .single();
  if (error) {
    console.error(error);
    return null;
  }
  return fromRow(data);
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