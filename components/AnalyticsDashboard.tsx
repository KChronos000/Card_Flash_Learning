'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  BarChart3,
  Clock,
  TrendingUp,
  Users,
  ArrowRight,
  GraduationCap,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  aggregateByGrade,
  overallStats,
  clearResults,
  getAllResults,
  type GradeAgg,
  type TestResult,
} from '@/lib/results-store';

const GRADE_COLORS: Record<string, string> = {
  'ม.4': 'hsl(199 89% 48%)',
  'ม.5': 'hsl(142 71% 45%)',
  'ม.6': 'hsl(38 92% 50%)',
};

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m} นาที ${s} วินาที`;
}

export function AnalyticsDashboard() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setResults(getAllResults());
    setMounted(true);

    const onResults = () => setResults(getAllResults());
    const onStorage = () => setResults(getAllResults());
    window.addEventListener('flashlearn_results_updated', onResults);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('flashlearn_results_updated', onResults);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const byGrade = useMemo<GradeAgg[]>(() => aggregateByGrade(results), [results]);
  const overall = useMemo(() => overallStats(results), [results]);

  const trendData = useMemo(() => {
    const sorted = [...results].sort(
      (a, b) =>
        new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );
    return sorted.map((r, i) => ({
      index: i + 1,
      pre: r.preScore,
      post: r.postScore,
    }));
  }, [results]);

  const barData = byGrade.map((g) => ({
    grade: g.grade,
    'Pre-test': Number(g.avgPre.toFixed(2)),
    'Post-test': Number(g.avgPost.toFixed(2)),
  }));

  function handleClear() {
    if (confirm('ต้องการล้างข้อมูลสถิติทั้งหมดในเครื่องนี้ใช่หรือไม่?')) {
      clearResults();
      setResults([]);
    }
  }

  if (!mounted) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
        <div className="h-72 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-sky-600 text-white shadow-lg">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              สถิติภาพรวม
            </h1>
            <p className="text-sm text-muted-foreground">
              ข้อมูลนิรนาม ไม่มีชื่อหรือข้อมูลส่วนบุคคลใดๆ
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              เริ่มเรียน
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            aria-label="ล้างข้อมูล"
            title="ล้างข้อมูลในเครื่องนี้"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="จำนวนผู้ทำแบบทดสอบ"
          value={`${overall.count}`}
          unit="คน"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="คะแนนเพิ่มขึ้นเฉลี่ย"
          value={`${overall.avgImprovementPct.toFixed(1)}`}
          unit="%"
          accent
        />
        <StatCard
          icon={<BarChart3 className="h-5 w-5" />}
          label="คะแนน Pre-test เฉลี่ย"
          value={overall.count ? overall.avgPre.toFixed(2) : '—'}
          unit="/ 3"
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="เวลาเฉลี่ยต่อครั้ง"
          value={overall.count ? formatDuration(overall.avgDurationSec) : '—'}
        />
      </div>

      {results.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-14 text-center">
            <p className="text-muted-foreground">
              ยังไม่มีข้อมูลแบบทดสอบในระบบ
            </p>
            <Link href="/" className="mt-4 inline-block">
              <Button className="gap-2">
                เริ่มทำแบบทดสอบแรก
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Grade comparison bar chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                เปรียบเทียบคะแนนเฉลี่ย Pre-test vs Post-test ตามระดับชั้น
              </CardTitle>
              <CardDescription>
                คะแนนเต็ม 3 ข้อ · แยกตาม ม.4 / ม.5 / ม.6
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barData}
                    margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="grade" tickLine={false} axisLine={false} />
                    <YAxis
                      domain={[0, 3]}
                      ticks={[0, 1, 2, 3]}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                      formatter={(v: number) => `${v.toFixed(2)} คะแนน`}
                    />
                    <Legend />
                    <Bar
                      dataKey="Pre-test"
                      fill="hsl(var(--muted-foreground))"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="Post-test"
                      fill="hsl(var(--primary))"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Improvement by grade + trend */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  % คะแนนเพิ่มขึ้นเฉลี่ยตามระดับชั้น
                </CardTitle>
                <CardDescription>
                  ความก้าวหน้าเฉลี่ยของนักเรียนในแต่ละชั้น
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={byGrade.map((g) => ({
                        grade: g.grade,
                        improvement: Number(g.avgImprovementPct.toFixed(1)),
                      }))}
                      margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="grade" tickLine={false} axisLine={false} />
                      <YAxis
                        unit="%"
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                        formatter={(v: number) => `+${v}%`}
                      />
                      <Bar dataKey="improvement" radius={[6, 6, 0, 0]}>
                        {byGrade.map((g) => (
                          <Cell key={g.grade} fill={GRADE_COLORS[g.grade]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  แนวโน้มคะแนนตามลำดับการทำ
                </CardTitle>
                <CardDescription>Pre-test vs Post-test ตามครั้งที่</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={trendData}
                      margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis
                        dataKey="index"
                        tickLine={false}
                        axisLine={false}
                        unit=""
                      />
                      <YAxis
                        domain={[0, 3]}
                        ticks={[0, 1, 2, 3]}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="pre"
                        name="Pre-test"
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="post"
                        name="Post-test"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Per-grade breakdown table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">สรุปตามระดับชั้น</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-2 pr-4 font-medium">ระดับชั้น</th>
                      <th className="py-2 pr-4 font-medium">จำนวนคน</th>
                      <th className="py-2 pr-4 font-medium">Pre-test เฉลี่ย</th>
                      <th className="py-2 pr-4 font-medium">Post-test เฉลี่ย</th>
                      <th className="py-2 font-medium">% เพิ่มขึ้น</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byGrade.map((g) => (
                      <tr key={g.grade} className="border-b last:border-0">
                        <td className="py-3 pr-4">
                          <span
                            className="inline-flex items-center gap-2 font-medium"
                          >
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ background: GRADE_COLORS[g.grade] }}
                            />
                            {g.grade}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          {g.count > 0 ? g.count : 'ยังไม่มีข้อมูล'}
                        </td>
                        <td className="py-3 pr-4">
                          {g.count ? g.avgPre.toFixed(2) : '—'}
                        </td>
                        <td className="py-3 pr-4">
                          {g.count ? g.avgPost.toFixed(2) : '—'}
                        </td>
                        <td className="py-3 font-semibold text-success">
                          {g.count ? `+${g.avgImprovementPct.toFixed(1)}%` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <p className="text-center text-xs text-muted-foreground">
        ข้อมูลเก็บในเครื่องของคุณเท่านั้น (localStorage) · ไม่มีการระบุตัวตน
      </p>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  unit,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  accent?: boolean;
}) {
  return (
    <Card className={accent ? 'border-primary/30 bg-primary/5' : ''}>
      <CardContent className="flex items-start gap-3 p-5">
        <div
          className={
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ' +
            (accent
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground')
          }
        >
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold">
            {value}
            {unit && (
              <span className="ml-1 text-sm font-medium text-muted-foreground">
                {unit}
              </span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
