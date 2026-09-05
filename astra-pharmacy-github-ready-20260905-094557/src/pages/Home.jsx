import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';
import GlassCard from '../components/GlassCard.jsx';
import OmniSearch from '../components/OmniSearch.jsx';
import { useAstraStore } from '../store/useAstraStore.js';

// ---------------------------------------------------------------------
// Home — simplified, redesigned:
//  1. A minimal welcome card (name + Hijri + Gregorian dates only).
//  2. A wide pill-shaped omni search bar (moved here from the TopNav).
//  3. Two loop boxes (best-sellers 2x2 + rotating phrases) merged here
//     from the now-deleted standalone LoopScreen page.
// ---------------------------------------------------------------------

function formatGregorian(d) {
  return new Intl.DateTimeFormat('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

function formatHijri(d) {
  try {
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return '';
  }
}

export default function Home() {
  const { state } = useAstraStore();
  const today = useMemo(() => new Date(), []);

  // Top-selling (last 30 days)
  const topSelling = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const counts = new Map();
    for (const s of state.salesLog) {
      if (new Date(s.timestamp) < cutoff) continue;
      counts.set(s.medicineId, (counts.get(s.medicineId) ?? 0) + s.qty);
    }
    return [...counts.entries()]
      .map(([id, qty]) => ({
        med: state.medicines.find((m) => m.id === id),
        qty,
      }))
      .filter((e) => e.med)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 4);
  }, [state.salesLog, state.medicines]);

  // Phrase rotation
  const [phraseIndex, setPhraseIndex] = useState(0);
  useEffect(() => {
    if (state.phrases.length <= 1) return;
    const i = setInterval(() => {
      setPhraseIndex((p) => (p + 1) % state.phrases.length);
    }, 8000);
    return () => clearInterval(i);
  }, [state.phrases.length]);

  return (
    <div className="space-y-5">
      {/* 1) Minimal welcome card */}
      <GlassCard className="p-5" strong>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🕌</div>
            <div>
              <div className="text-lg md:text-xl font-extrabold">
                صيدلية أسترا
              </div>
              <div className="text-sm text-[var(--text-secondary)] mt-0.5">
                {formatGregorian(today)}
              </div>
            </div>
          </div>
          <div className="text-end">
            <div className="text-xs text-[var(--text-secondary)]">التاريخ الهجري</div>
            <div className="text-base font-bold">{formatHijri(today)}</div>
          </div>
        </div>
      </GlassCard>

      {/* 2) Wide pill search bar */}
      <div className="w-full">
        <div
          className="glass glass-sm p-2"
          style={{ borderRadius: 999 }}
        >
          <OmniSearch wide />
        </div>
      </div>

      {/* 3) Two loop boxes side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Best sellers 2x2 */}
        <GlassCard className="p-5" strong distort>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-extrabold flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-600" />
              الأكثر مبيعاً
            </h2>
            <span className="text-xs text-[var(--text-secondary)]">آخر 30 يوم</span>
          </div>
          {topSelling.length === 0 ? (
            <div className="text-center py-10 text-[var(--text-secondary)]">
              لا توجد مبيعات مسجلة بعد
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {topSelling.map((e, i) => (
                <div
                  key={e.med.id}
                  className="glass glass-xs p-3 flex flex-col gap-1 min-h-[110px] justify-between"
                >
                  <div>
                    <div className="text-[10px] text-[var(--text-secondary)] uppercase">
                      #{i + 1}
                    </div>
                    <div className="font-extrabold text-sm leading-tight truncate">
                      {e.med.tradeName}
                    </div>
                    <div className="text-[11px] text-[var(--text-secondary)] truncate">
                      {e.med.condition}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[var(--text-secondary)]">
                      رف {e.med.shelf}
                    </span>
                    <span className="chip chip-mint !text-xs !px-2 !py-0.5">
                      {e.qty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Phrases */}
        <GlassCard className="p-5" strong distort>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-extrabold flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" />
              عبارات ومُنى
            </h2>
            <span className="text-xs text-[var(--text-secondary)]">تدوير كل 8 ثوانٍ</span>
          </div>
          <div
            className="flex items-center justify-center min-h-[180px] text-center"
            dir="rtl"
          >
            {state.phrases.length === 0 ? (
              <p className="text-[var(--text-secondary)] text-sm">
                لا توجد عبارات. أضف من تبويب "العبارات" داخل الإدارة.
              </p>
            ) : (
              <div
                key={phraseIndex}
                className="phrase-fade font-ruqaa bronze leading-relaxed"
                style={{ fontSize: 'clamp(1.4rem, 2.6vw, 2.2rem)' }}
              >
                {state.phrases[phraseIndex]}
              </div>
            )}
          </div>
          <div className="flex items-center justify-center gap-1 mt-3">
            {state.phrases.map((_, i) => (
              <span
                key={i}
                className={`pin-dot ${i === phraseIndex ? 'filled' : ''}`}
                style={{ width: 8, height: 8 }}
              />
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
