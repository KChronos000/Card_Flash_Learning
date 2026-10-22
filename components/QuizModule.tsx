'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  BrainCircuit,
  RotateCcw,
  ClipboardCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { QuizQuestion } from '@/lib/mock-data';

export type StepKey = 'pretest' | 'study' | 'posttest' | 'summary';

export const STEP_ORDER: StepKey[] = ['pretest', 'study', 'posttest', 'summary'];
export const STEP_LABELS: Record<StepKey, string> = {
  pretest: 'Pre-test',
  study: 'เรียนการ์ด',
  posttest: 'Post-test',
  summary: 'สรุปผล',
};

// ---------------------------------------------------------------------------
// Step navigation (clickable stepper)
// ---------------------------------------------------------------------------

export function StepNavigation({
  current,
  furthestIndex,
  onStepClick,
}: {
  current: StepKey;
  furthestIndex: number;
  onStepClick?: (step: StepKey) => void;
}) {
  const currentIndex = STEP_ORDER.indexOf(current);

  return (
    <ol className="flex items-center gap-1 sm:gap-2">
      {STEP_ORDER.map((key, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const reachable = i <= furthestIndex;
        const label = STEP_LABELS[key];

        const content = (
          <span
            className={cn(
              'flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors',
              active && 'bg-primary text-primary-foreground shadow-sm',
              done && 'bg-success/15 text-success',
              !active && !done && reachable && 'bg-muted text-muted-foreground',
              !reachable && 'bg-muted/50 text-muted-foreground/50'
            )}
          >
            <span
              className={cn(
                'flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold',
                done && 'bg-success text-white',
                active && 'bg-primary-foreground/30 text-primary-foreground',
                !active && !done && 'bg-background text-muted-foreground'
              )}
            >
              {done ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            <span className="hidden sm:inline">{label}</span>
          </span>
        );

        return (
          <li key={key} className="flex items-center gap-1 sm:gap-2">
            {reachable && onStepClick ? (
              <button
                type="button"
                onClick={() => onStepClick(key)}
                className="rounded-full transition-transform hover:scale-[1.02]"
                aria-label={`ไปยังขั้นตอน ${label}`}
              >
                {content}
              </button>
            ) : (
              content
            )}
            {i < STEP_ORDER.length - 1 && (
              <span
                className={cn(
                  'h-px w-3 sm:w-6',
                  i < currentIndex ? 'bg-success/40' : 'bg-border'
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

// ---------------------------------------------------------------------------
// Quiz engine — reusable for pre-test and post-test
// ---------------------------------------------------------------------------

interface QuizModuleProps {
  title: string;
  subtitle?: string;
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
  onBack: () => void;
  onContinue: () => void;
  continueLabel?: string;
}

export function QuizModule({
  title,
  subtitle,
  questions,
  onComplete,
  onBack,
  onContinue,
  continueLabel = 'ไปขั้นตอนถัดไป',
}: QuizModuleProps) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => Array(questions.length).fill(null)
  );
  const [finished, setFinished] = useState(false);

  const q = questions[current];
  const isLast = current === questions.length - 1;
  const isFirst = current === 0;
  const selected = answers[current];
  const hasAnswered = selected !== null;

  function selectChoice(idx: number) {
    if (hasAnswered) return;
    const next = [...answers];
    next[current] = idx;
    setAnswers(next);
  }

  function goNext() {
    if (!hasAnswered) return;
    if (isLast) {
      const score = answers.reduce<number>(
        (acc, ans, i) => acc + (ans === questions[i].correctIndex ? 1 : 0),
        0
      );
      setFinished(true);
      onComplete(score);
      return;
    }
    setCurrent((c) => c + 1);
  }

  function goPrev() {
    if (isFirst) {
      onBack();
      return;
    }
    setCurrent((c) => c - 1);
  }

  function restart() {
    setAnswers(Array(questions.length).fill(null));
    setCurrent(0);
    setFinished(false);
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          ยังไม่มีคำถามสำหรับหัวข้อนี้
        </CardContent>
      </Card>
    );
  }

  const score = answers.reduce<number>(
    (acc, ans, i) => acc + (ans === questions[i].correctIndex ? 1 : 0),
    0
  );

  if (finished) {
    return (
      <Card className="animate-pop-in">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BrainCircuit className="h-7 w-7" />
          </div>
          <CardTitle>เสร็จสิ้นแบบทดสอบ!</CardTitle>
          <CardDescription>
            คุณได้คะแนน {score} / {questions.length} ข้อ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {questions.map((qq, i) => {
            const correct = answers[i] === qq.correctIndex;
            return (
              <div
                key={qq.id}
                className={cn(
                  'rounded-lg border p-3 text-sm',
                  correct
                    ? 'border-success/30 bg-success/5'
                    : 'border-destructive/30 bg-destructive/5'
                )}
              >
                <div className="flex items-start gap-2">
                  {correct ? (
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  ) : (
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  )}
                  <div>
                    <p className="font-medium">{qq.question}</p>
                    {!correct && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        ตอบที่ถูก: {qq.choices[qq.correctIndex]}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {qq.explanation}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <Button onClick={onContinue} className="flex-1 gap-2">
              {continueLabel}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button onClick={restart} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              ทำใหม่
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

  const progress = ((current + (hasAnswered ? 1 : 0)) / questions.length) * 100;

  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <div className="mb-3 flex items-center justify-between gap-2">
          <Badge className="gap-1.5">
            <ClipboardCheck className="h-3.5 w-3.5" />
            {title} · ข้อ {current + 1}/{questions.length}
          </Badge>
          {subtitle && (
            <span className="hidden text-xs text-muted-foreground sm:block">
              {subtitle}
            </span>
          )}
        </div>
        <Progress value={progress} className="h-2" />
        <CardTitle className="mt-4 text-lg leading-snug">{q.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {q.choices.map((choice, idx) => {
          const isSelected = selected === idx;
          const isCorrect = idx === q.correctIndex;
          const showCorrect = hasAnswered && isCorrect;
          const showWrong = hasAnswered && isSelected && !isCorrect;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => selectChoice(idx)}
              disabled={hasAnswered}
              className={cn(
                'flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all',
                !hasAnswered &&
                  'hover:border-primary/50 hover:bg-primary/5 active:scale-[0.99]',
                showCorrect && 'border-success bg-success/10 text-success',
                showWrong && 'border-destructive bg-destructive/10 text-destructive',
                hasAnswered && !showCorrect && !showWrong && 'opacity-60',
                !hasAnswered && 'border-border bg-card'
              )}
            >
              <span className="flex items-center gap-3">
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold',
                    showCorrect && 'border-success bg-success text-white',
                    showWrong && 'border-destructive bg-destructive text-white',
                    !showCorrect && !showWrong && 'border-border bg-muted'
                  )}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                {choice}
              </span>
              {showCorrect && <Check className="h-5 w-5" />}
              {showWrong && <X className="h-5 w-5" />}
            </button>
          );
        })}

        {hasAnswered && (
          <div className="mt-3 rounded-lg bg-muted/60 p-3 text-sm">
            <p className="font-medium text-muted-foreground">คำอธิบาย</p>
            <p className="mt-1">{q.explanation}</p>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-2">
          <Button onClick={goPrev} variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {isFirst ? 'ย้อนกลับ' : 'ข้อก่อนหน้า'}
          </Button>
          <Button onClick={goNext} disabled={!hasAnswered} className="gap-2">
            {isLast ? 'ดูผลคะแนน' : 'ข้อถัดไป'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
