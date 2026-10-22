'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Brain,
  ClipboardCheck,
  GraduationCap,
  ListChecks,
  Sparkles,
  ArrowLeft,
  Award,
  TrendingUp,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FlashcardView } from '@/components/FlashcardView';
import { QuizModule, StepNavigation, type StepKey } from '@/components/QuizModule';
import { useStoredGrade, AppShell } from '@/components/Navbar';
import { Atom, Sigma, type LucideIcon } from 'lucide-react';
import {
  getFlashcardsByTopic,
  getQuizByTopic,
  getSubject,
  getTopicsBySubject,
  subjects,
  type SubjectId,
  type Topic,
} from '@/lib/mock-data';
import {
  saveResult,
  type GradeLevel,
  type TestResult,
} from '@/lib/results-store';

type Stage = 'select' | 'pretest' | 'study' | 'posttest' | 'summary';

const subjectIcons: Record<string, LucideIcon> = {
  Atom,
  Sigma,
};

export default function Home() {
  const [grade, setGrade] = useStoredGrade();
  const [subject, setSubject] = useState<SubjectId>('physics');
  const [topic, setTopic] = useState<Topic | null>(null);
  const [stage, setStage] = useState<Stage>('select');

  const [preScore, setPreScore] = useState(0);
  const [postScore, setPostScore] = useState(0);
  const [preDone, setPreDone] = useState(false);
  const [savedResult, setSavedResult] = useState<TestResult | null>(null);

  const startTimeRef = useRef<number | null>(null);

  const flashcards = useMemo(
    () => (topic ? getFlashcardsByTopic(topic.id) : []),
    [topic]
  );
  const quiz = useMemo(() => (topic ? getQuizByTopic(topic.id) : []), [topic]);
  const topics = useMemo(() => getTopicsBySubject(subject), [subject]);

  useEffect(() => {
    setTopic(null);
    setStage('select');
  }, [subject]);

  const furthestStepIndex = useMemo(() => {
    const order: StepKey[] = ['pretest', 'study', 'posttest', 'summary'];
    let furthest = 0; // pretest always reachable
    if (preDone) furthest = Math.max(furthest, 1); // study
    if (preDone) furthest = Math.max(furthest, 2); // posttest
    if (savedResult) furthest = Math.max(furthest, 3); // summary
    // Cap to current stage so we never light up steps past where we are
    const currentIdx = order.indexOf(stage as StepKey);
    return Math.min(furthest, Math.max(0, currentIdx));
  }, [stage, preDone, savedResult]);

  function pickTopic(t: Topic) {
    if (!grade) return;
    setTopic(t);
    setPreScore(0);
    setPostScore(0);
    setPreDone(false);
    setSavedResult(null);
    setStage('pretest');
    startTimeRef.current = Date.now();
  }

  function goBackToSelect() {
    setTopic(null);
    setStage('select');
  }

  function handlePretestComplete(score: number) {
    setPreScore(score);
    setPreDone(true);
  }

async function handlePosttestComplete(score: number) {
  setPostScore(score);
  if (!topic || !grade || !startTimeRef.current) return;
  const durationSec = Math.round((Date.now() - startTimeRef.current) / 1000);
  const improvementPct = (quiz.length ? (score - preScore) / quiz.length : 0) * 100;

  const result = await saveResult({
    grade: topic.level,
    topicId: topic.id,
    topicName: topic.name,
    subjectId: topic.subjectId,
    preScore,
    postScore: score,
    totalQuestions: quiz.length,
    durationSec,
    improvementPct,
  });

  if (!result) {
    alert('บันทึกผลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    return;
  }

  setSavedResult(result);
  setStage('summary');
}

  function handleStepClick(step: StepKey) {
    // Only allow jumping to already-reached steps.
    const reached: Stage[] = (() => {
      const base: Stage[] = ['pretest'];
      if (preDone) base.push('study');
      if (preDone) base.push('posttest');
      if (savedResult) base.push('summary');
      return base;
    })();
    if (reached.includes(step as Stage)) {
      setStage(step as Stage);
    }
  }

  // ---------- Grade gate ----------
  if (!grade) {
    return <GradeSelection onPick={setGrade} />;
  }

  // ---------- Topic selection ----------
  if (stage === 'select' || !topic) {
    return (
      <div className="space-y-8">
        <Hero grade={grade} />

        <div className="flex flex-wrap items-center gap-2">
          {subjects.map((s) => {
            const Icon = subjectIcons[s.icon] ?? Atom;
            const active = s.id === subject;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSubject(s.id)}
                className={
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ' +
                  (active
                    ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground')
                }
              >
                <Icon className="h-4 w-4" />
                {s.name}
              </button>
            );
          })}
        </div>

        <TopicGrid
          subjectId={subject}
          topics={topics}
          grade={grade}
          onSelect={pickTopic}
        />
      </div>
    );
  }

  // ---------- In-session header (stepper + back) ----------
  const stepKey = stage as StepKey;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StepNavigation
          current={stepKey}
          furthestIndex={Math.max(0, furthestStepIndex)}
          onStepClick={handleStepClick}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={goBackToSelect}
          className="gap-2 text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          เลือกหัวข้อใหม่
        </Button>
      </div>

      {stage === 'pretest' && (
        <Section
          icon={<ClipboardCheck className="h-5 w-5" />}
          title="Pre-test — แบบทดสอบก่อนเรียน"
          description={`หัวข้อ: ${topic.name} · ทำ ${quiz.length} ข้อ เพื่อวัดความรู้เดิม`}
        >
          <div className="mx-auto max-w-2xl">
            {preDone ? (
              <PretestDone
                score={preScore}
                total={quiz.length}
                onContinue={() => setStage('study')}
                onRetake={() => {
                  setPreDone(false);
                  setPreScore(0);
                }}
                onBack={goBackToSelect}
              />
            ) : (
              <QuizModule
                title={`Pre-test · ${topic.name}`}
                questions={quiz}
                onComplete={handlePretestComplete}
                onBack={goBackToSelect}
                onContinue={() => setStage('study')}
                continueLabel="เริ่มฝึกการ์ดความจำ"
              />
            )}
          </div>
        </Section>
      )}

      {stage === 'study' && (
        <Section
          icon={<Brain className="h-5 w-5" />}
          title={`การ์ดความจำ — ${topic.name}`}
          description="พลิกการ์ดเพื่อดูเฉลย และจำสูตรสำคัญ ใช้ปุ่มลูกศรเพื่อเปลี่ยนการ์ด"
        >
          <FlashcardView
            cards={flashcards}
            onBack={() => setStage('pretest')}
            nextStageLabel="ทำ Post-test"
            onNextStage={() => setStage('posttest')}
          />
        </Section>
      )}

      {stage === 'posttest' && (
        <Section
          icon={<ClipboardCheck className="h-5 w-5" />}
          title="Post-test — แบบทดสอบหลังเรียน"
          description="ทำแบบทดสอบอีกครั้งเพื่อดูความก้าวหน้าของคุณ"
        >
          <div className="mx-auto max-w-2xl">
            <QuizModule
              title={`Post-test · ${topic.name}`}
              questions={quiz}
              onComplete={handlePosttestComplete}
              onBack={() => setStage('study')}
              onContinue={() => setStage('summary')}
              continueLabel="ดูสรุปผล"
            />
          </div>
        </Section>
      )}

      {stage === 'summary' && savedResult && (
        <Section
          icon={<ListChecks className="h-5 w-5" />}
          title="สรุปผลการเรียน"
          description={`หัวข้อ: ${topic.name} · ระดับชั้น ${grade}`}
        >
          <Summary
            result={savedResult}
            onRetakePosttest={() => setStage('posttest')}
            onPickNewTopic={goBackToSelect}
          />
        </Section>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

function Hero({ grade }: { grade: GradeLevel }) {
  return (
    <section className="animate-fade-in-up">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-8 sm:p-12">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
        <Badge className="mb-4 gap-1.5 bg-primary/10 text-primary hover:bg-primary/10">
          <Sparkles className="h-3.5 w-3.5" />
          ฝึกสั้น เข้าใจง่าย ทันสอบ · ระดับชั้น {grade}
        </Badge>
        <h2 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          ฝึกการ์ดความจำ <span className="text-primary">Micro-Learning</span>{' '}
          สำหรับ ม.ปลาย
        </h2>
        <p className="mt-3 max-w-xl text-muted-foreground">
          เรียนรู้เคมี ฟิสิกส์ ชีววิทยา และคณิตศาสตร์ ผ่านการ์ดพลิกแบบโต้ตอบ
          พร้อมแบบทดสอบก่อน-หลังเรียน เพื่อวัดความก้าวหน้าของคุณ
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Chip icon={<Brain className="h-4 w-4" />} label="การ์ดพลิก 3D" />
          <Chip icon={<ClipboardCheck className="h-4 w-4" />} label="Pre/Post-test" />
          <Chip icon={<Sparkles className="h-4 w-4" />} label="รับ EXP & ตรารางวัล" />
        </div>
      </div>
    </section>
  );
}

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-3.5 py-1.5 text-sm font-medium shadow-sm backdrop-blur">
      {icon}
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Grade selection (first-run gate)
// ---------------------------------------------------------------------------

function GradeSelection({ onPick }: { onPick: (g: GradeLevel) => void }) {
  const grades: { id: GradeLevel; desc: string }[] = [
    { id: 'ม.4', desc: 'พื้นฐานวิทยาศาสตร์และคณิตศาสตร์' },
    { id: 'ม.5', desc: 'เนื้อหาเชิงลึก เคมี ฟิสิกส์ ชีววิทยา' },
    { id: 'ม.6', desc: 'ทบทวนและเตรียมสอบ A-Level' },
  ];
  return (
    <div className="mx-auto max-w-2xl animate-fade-in-up space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-sky-600 text-white shadow-lg shadow-primary/30">
          <GraduationCap className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          ยินดีต้อนรับสู่ FlashLearn TH
        </h2>
        <p className="mt-2 text-muted-foreground">
          เลือกระดับชั้นของคุณ (ข้อมูลนิรนาม ไม่ต้องใส่ชื่อ)
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {grades.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => onPick(g.id)}
            className="group flex flex-col items-center gap-2 rounded-2xl border-2 border-border bg-card p-6 text-center transition-all hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:shadow-primary/10"
          >
            <span className="text-3xl font-extrabold text-primary">{g.id}</span>
            <span className="text-sm text-muted-foreground">{g.desc}</span>
            <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
              เริ่มเรียน <ArrowRight className="h-4 w-4" />
            </span>
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        คุณสามารถเปลี่ยนระดับชั้นได้ตลอดเวลาที่แถบเมนูด้านบน
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Topic grid
// ---------------------------------------------------------------------------

function TopicGrid({
  subjectId,
  topics,
  grade,
  onSelect,
}: {
  subjectId: SubjectId;
  topics: Topic[];
  grade: GradeLevel;
  onSelect: (t: Topic) => void;
}) {
  const subject = getSubject(subjectId);
  const SubjectIcon = subject ? subjectIcons[subject.icon] : Atom;

  return (
    <section className="animate-fade-in-up">
      <div className="mb-5 flex items-center gap-3">
        {subject && (
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${subject.color} text-white shadow-lg`}
          >
            <SubjectIcon className="h-6 w-6" />
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            {subject?.name} — เลือกหัวข้อ
          </h2>
          <p className="text-sm text-muted-foreground">
            {subject?.description} · เรียนได้ทันที ไม่จำเป็นต้องเริ่มจาก Pre-test
          </p>
        </div>
      </div>

      {topics.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-muted-foreground">
            ยังไม่มีหัวข้อสำหรับวิชานี้ในตอนนี้
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => {
            const matchingGrade = topic.level === grade;
            return (
              <Card
                key={topic.id}
                className="group relative overflow-hidden border-border/60 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${subject?.color ?? 'from-primary to-sky-600'}`}
                />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="font-medium">
                      {topic.level}
                    </Badge>
                    {matchingGrade && (
                      <Badge className="bg-success/15 text-success hover:bg-success/15">
                        ตรงกับชั้นของคุณ
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-2 text-lg">{topic.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {topic.nameEn} · ~{topic.estMinutes} นาที
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {topic.description}
                  </p>
                  <Button
                    className="mt-4 w-full gap-2"
                    onClick={() => onSelect(topic)}
                  >
                    เริ่มเรียน
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Pre-test done transitional screen
// ---------------------------------------------------------------------------

function PretestDone({
  score,
  total,
  onContinue,
  onRetake,
  onBack,
}: {
  score: number;
  total: number;
  onContinue: () => void;
  onRetake: () => void;
  onBack: () => void;
}) {
  return (
    <Card className="animate-pop-in">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ClipboardCheck className="h-7 w-7" />
        </div>
        <CardTitle>Pre-test เสร็จสิ้น</CardTitle>
        <CardDescription>
          คะแนน {score} / {total} ข้อ · มาเริ่มฝึกการ์ดความจำเพื่อพัฒนากัน
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={onContinue} className="flex-1 gap-2">
            <Sparkles className="h-4 w-4" />
            เริ่มฝึกการ์ดความจำ
          </Button>
          <Button onClick={onRetake} variant="outline" className="gap-2">
            ทำ Pre-test ใหม่
          </Button>
          <Button onClick={onBack} variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            ย้อนกลับ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

function Summary({
  result,
  onRetakePosttest,
  onPickNewTopic,
}: {
  result: TestResult;
  onRetakePosttest: () => void;
  onPickNewTopic: () => void;
}) {
  const delta = result.postScore - result.preScore;
  const TrendIcon = delta > 0 ? TrendingUp : ArrowLeft;
  const trendColor =
    delta > 0 ? 'text-success' : delta < 0 ? 'text-destructive' : 'text-muted-foreground';
  const minutes = Math.floor(result.durationSec / 60);
  const seconds = result.durationSec % 60;
  const perfect = result.postScore === result.totalQuestions && result.totalQuestions > 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="animate-pop-in overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary via-sky-500 to-accent" />
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-sky-600 text-white shadow-lg shadow-primary/30">
            <Award className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl">สรุปผลการเรียน</CardTitle>
          <CardDescription>
            หัวข้อ: {result.topicName} · ระดับชั้น {result.grade}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <ScoreBlock
              label="Pre-test"
              score={result.preScore}
              total={result.totalQuestions}
              tone="muted"
            />
            <ScoreBlock
              label="Post-test"
              score={result.postScore}
              total={result.totalQuestions}
              tone="primary"
            />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Stat
              icon={<TrendIcon className={`h-4 w-4 ${trendColor}`} />}
              label="คะแนนเพิ่มขึ้น"
              value={`${delta > 0 ? '+' : ''}${delta} ข้อ`}
              valueClass={trendColor}
            />
            <Stat
              icon={<TrendingUp className="h-4 w-4" />}
              label="% พัฒนาการ"
              value={`${result.improvementPct.toFixed(0)}%`}
              valueClass="text-primary"
            />
            <Stat
              icon={<Clock className="h-4 w-4" />}
              label="เวลาที่ใช้"
              value={`${minutes} น. ${seconds} ว.`}
            />
          </div>

          {perfect && (
            <div className="mt-5 rounded-xl border border-accent/30 bg-accent/10 p-4 text-center">
              <p className="flex items-center justify-center gap-2 font-semibold text-accent">
                <Award className="h-5 w-5" />
                ได้รับตรา: Master — ทำถูกทุกข้อ!
              </p>
            </div>
          )}

          <div className="mt-5 rounded-xl border border-success/30 bg-success/5 p-4 text-center">
            <p className="flex items-center justify-center gap-2 text-sm font-medium text-success">
              <ListChecks className="h-4 w-4" />
              ข้อมูลการเรียนของคุณถูกบันทึกลงในสถิติภาพรวมเรียบร้อยแล้ว
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button onClick={onRetakePosttest} variant="outline" className="gap-2">
          ทำ Post-test ใหม่
        </Button>
        <Button onClick={onPickNewTopic} className="gap-2">
          เลือกหัวข้อใหม่
        </Button>
        <Link href="/analytics">
          <Button variant="ghost" className="gap-2">
            ดูสถิติภาพรวม
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function ScoreBlock({
  label,
  score,
  total,
  tone,
}: {
  label: string;
  score: number;
  total: number;
  tone: 'primary' | 'muted';
}) {
  const pct = total > 0 ? (score / total) * 100 : 0;
  return (
    <div
      className={
        'rounded-xl border p-5 text-center ' +
        (tone === 'primary'
          ? 'border-primary/30 bg-primary/5'
          : 'border-border bg-muted/30')
      }
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold">
        {score}
        <span className="text-base font-normal text-muted-foreground">
          {' '}
          / {total}
        </span>
      </p>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-background">
        <div
          className={
            'h-full rounded-full transition-all ' +
            (tone === 'primary' ? 'bg-primary' : 'bg-muted-foreground/40')
          }
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">{pct.toFixed(0)}%</p>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className={'mt-1 text-lg font-bold ' + (valueClass ?? '')}>{value}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="animate-fade-in-up">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}
