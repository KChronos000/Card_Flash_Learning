'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, GraduationCap, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GradeLevel } from '@/lib/results-store';

const GRADE_KEY = 'flashlearn_grade';
const VALID_GRADES: GradeLevel[] = ['ม.4', 'ม.5', 'ม.6'];

function isGrade(v: unknown): v is GradeLevel {
  return typeof v === 'string' && (VALID_GRADES as string[]).includes(v);
}

export function Navbar({ grade, onGradeChange }: { grade: GradeLevel | null; onGradeChange: (g: GradeLevel) => void }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-sky-600 text-primary-foreground shadow-lg shadow-primary/30">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <h1 className="text-lg font-bold tracking-tight">
              Flash<span className="text-primary">Learn</span>
            </h1>
            <p className="hidden text-xs text-muted-foreground sm:block">
              ฝึกการ์ดความจำ ม.ปลาย
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/"
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              pathname === '/'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">เรียน</span>
          </Link>
          <Link
            href="/analytics"
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              pathname === '/analytics'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">สถิติภาพรวม</span>
          </Link>

          <div className="ml-1 flex items-center gap-1 rounded-lg bg-muted p-1">
            {VALID_GRADES.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => onGradeChange(g)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-semibold transition-colors',
                  grade === g
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                aria-pressed={grade === g}
              >
                {g}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [grade, setGrade] = useState<GradeLevel | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(GRADE_KEY);
      if (isGrade(stored)) setGrade(stored);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const changeGrade = useCallback((g: GradeLevel) => {
    setGrade(g);
    try {
      localStorage.setItem(GRADE_KEY, g);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div className="min-h-screen app-gradient">
      <Navbar grade={grade} onGradeChange={changeGrade} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {ready ? children : <div className="h-64 animate-pulse rounded-2xl bg-muted" />}
      </main>
      <footer className="mx-auto max-w-6xl px-4 pb-10 text-center text-xs text-muted-foreground sm:px-6">
        FlashLearn TH · สร้างเพื่อนักเรียนมัธยมปลาย · ข้อมูลนิรนามเพื่อการเรียนรู้
      </footer>
    </div>
  );
}

export function useStoredGrade(): [GradeLevel | null, (g: GradeLevel) => void] {
  const [grade, setGrade] = useState<GradeLevel | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(GRADE_KEY);
      if (isGrade(stored)) setGrade(stored);
    } catch {
      /* ignore */
    }
  }, []);

  const change = (g: GradeLevel) => {
    setGrade(g);
    try {
      localStorage.setItem(GRADE_KEY, g);
    } catch {
      /* ignore */
    }
  };

  return [grade, change];
}
