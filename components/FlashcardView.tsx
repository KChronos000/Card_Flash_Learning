'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  RotateCcw,
  Volume2,
  Lightbulb,
  Repeat2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { Flashcard as FlashcardType } from '@/lib/mock-data';

function speak(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'th-TH';
  u.rate = 0.95;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

// ---------------------------------------------------------------------------
// Single flip card
// ---------------------------------------------------------------------------

function FlipCard({ card, isFlipped, onFlip }: { card: FlashcardType; isFlipped: boolean; onFlip: () => void }) {
  return (
    <div
      className="flip-card relative h-full w-full cursor-pointer select-none"
      onClick={onFlip}
      role="button"
      tabIndex={0}
      aria-label="การ์ดความจำ — คลิกเพื่อพลิก"
    >
      <div className={cn('flip-card-inner relative h-full w-full', isFlipped && 'is-flipped')}>
        {/* FRONT */}
        <div className="flip-card-face absolute inset-0 flex flex-col rounded-2xl border border-border/70 bg-gradient-to-br from-card to-muted/40 p-6 shadow-lg sm:p-8">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              คำถาม
            </span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); speak(card.front); }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              aria-label="อ่านออกเสียง"
              title="อ่านออกเสียง"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="text-xl font-semibold leading-relaxed sm:text-2xl">{card.front}</p>
            {card.hint && (
              <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lightbulb className="h-3.5 w-3.5 text-accent" />
                คำใบ้: {card.hint}
              </p>
            )}
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Repeat2 className="h-3.5 w-3.5" />
            คลิกเพื่อดูเฉลย
          </div>
        </div>

        {/* BACK */}
        <div className="flip-card-face flip-card-back absolute inset-0 flex flex-col rounded-2xl border border-primary/30 bg-gradient-to-br from-primary to-sky-600 p-6 text-primary-foreground shadow-xl sm:p-8">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">เฉลย</span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); speak(card.back); }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
              aria-label="อ่านออกเสียงเฉลย"
              title="อ่านออกเสียง"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="text-lg leading-relaxed sm:text-xl">{card.back}</p>
            {card.formula && (
              <div className="mt-5 rounded-xl bg-white/15 px-4 py-2.5 font-mono text-base font-semibold tracking-wide sm:text-lg">
                {card.formula}
              </div>
            )}
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-white/80">
            <Repeat2 className="h-3.5 w-3.5" />
            คลิกเพื่อกลับด้านหน้า
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Flashcard deck — navigation, shuffle, keyboard support
// ---------------------------------------------------------------------------

interface FlashcardViewProps {
  cards: FlashcardType[];
  onBack: () => void;
  onComplete?: () => void;
  onNextStage?: () => void;
  nextStageLabel?: string;
}

export function FlashcardView({
  cards,
  onBack,
  onComplete,
  onNextStage,
  nextStageLabel = 'ขั้นตอนถัดไป',
}: FlashcardViewProps) {
  const [order, setOrder] = useState<number[]>(() => cards.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const index = order[pos];
  const card = cards[index];
  const isLast = pos === cards.length - 1;
  const pct = cards.length > 0 ? ((pos + 1) / cards.length) * 100 : 0;

  const goNext = useCallback(() => {
    setFlipped(false);
    setPos((p) => Math.min(p + 1, cards.length - 1));
  }, [cards.length]);

  const goPrev = useCallback(() => {
    setFlipped(false);
    setPos((p) => Math.max(p - 1, 0));
  }, []);

  const shuffle = useCallback(() => {
    setOrder([...order].sort(() => Math.random() - 0.5));
    setPos(0);
    setFlipped(false);
  }, [order]);

  const reset = useCallback(() => {
    setOrder(cards.map((_, i) => i));
    setPos(0);
    setFlipped(false);
  }, [cards]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  if (cards.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          ยังไม่มีการ์ดความจำสำหรับหัวข้อนี้
        </div>
        <Button onClick={onBack} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          ย้อนกลับ
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>การ์ดที่ {pos + 1} จาก {cards.length}</span>
          <span>{pos + 1} / {cards.length}</span>
        </div>
        <Progress value={pct} className="h-2" />
      </div>

      <div className="relative mx-auto h-[340px] w-full max-w-2xl sm:h-[380px]">
        <FlipCard card={card} isFlipped={flipped} onFlip={() => setFlipped((f) => !f)} />
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button variant="outline" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          ย้อนกลับ
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goPrev} disabled={pos === 0} aria-label="การ์ดก่อนหน้า">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={goNext} disabled={isLast} aria-label="การ์ดถัดไป">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <Button variant="ghost" size="sm" onClick={shuffle} className="gap-2">
          <Shuffle className="h-4 w-4" /> สุ่ม
        </Button>
        <Button variant="ghost" size="sm" onClick={reset} className="gap-2">
          <RotateCcw className="h-4 w-4" /> เริ่มใหม่
        </Button>

        {isLast && onNextStage && (
          <Button
            onClick={() => { onComplete?.(); onNextStage(); }}
            className="gap-2"
          >
            {nextStageLabel}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        ใช้ปุ่มลูกศร ← → เพื่อเปลี่ยนการ์ด · กด Space/Enter เพื่อพลิก
      </p>
    </div>
  );
}
