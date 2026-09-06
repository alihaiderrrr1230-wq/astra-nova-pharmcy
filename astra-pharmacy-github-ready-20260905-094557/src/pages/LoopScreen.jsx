import React, { useEffect, useMemo, useState } from 'react';
import { Tv, Sparkles } from 'lucide-react';
import GlassCard from '../components/GlassCard.jsx';
import ShelfMap from '../components/ShelfMap.jsx';
import { useAstraStore } from '../store/useAstraStore.js';

// ---------------------------------------------------------------------
// Loop & Shelf Display
// - Left half: auto-rotates through 4 of the pharmacy's top-20 best-selling
//   medicines (by 30-day sales), cycling every 5 minutes, 2×2 grid.
// - Right half: rotating Arabic phrases in Aref Ruqaa, cross-fading
//   every ~8 seconds.
// - Below: the visual shelf map with a highlighted cell.
// ---------------------------------------------------------------------

function currency(n) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export default function LoopScreen() {
  const { state } = useAstraStore();

  // Top-selling (last 30 days) — we use the sales log
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
      .slice(0, 20);
  }, [state.salesLog, state.medicines]);

  // Group of 4 (rotating index)
  const [page, setPage] = useState(0);
  useEffect(() => {
    if (topSelling.length <= 4) return;
    const i = setInterval(() => {
      setPage((p) => (p + 1) % Math.ceil(topSelling.length / 4));
    }, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(i);
  }, [topSelling.length]);

  const visibleFour = useMemo(() => {
    return topSelling.slice(page * 4, page * 4 + 4);
  }, [topSelling, page]);

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
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Tv size={20} />
        <h1 className="text-2xl font-extrabold">شاشة العرض</h1>
        <span className="chip chip-cyan">Loop Display</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Best sellers — 2x2 grid */}
        <GlassCard className="p-6" strong distort>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" />
              الأكثر مبيعاً
            </h2>
            <span className="text-xs text-[var(--text-secondary)]">
              {topSelling.length > 0
                ? `المجموعة ${page + 1} / ${Math.max(
                    1,
                    Math.ceil(topSelling.length / 4)
                  )}`
                : 'لا توجد بيانات'}
            </span>
          </div>

          {visibleFour.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-secondary)]">
              لا توجد مبيعات مسجلة بعد
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {visibleFour.map((e, i) => (
                <div
                  key={`${page}-${i}`}
                  className="glass glass-sm p-4 flex flex-col gap-1 min-h-[140px] justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">
                        #{page * 4 + i + 1}
                      </div>
                      <div className="font-extrabold text-lg leading-tight">
                        {e.med.tradeName}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        {e.med.condition}
                      </div>
                    </div>
                    <span className="chip chip-mint !text-base !px-2 !py-1">
                      {e.qty}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    {e.med.form} • {e.med.dose} • عمود {e.med.shelf}
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Phrases — Aref Ruqaa, bronze tone */}
        <GlassCard className="p-6" strong distort>
          <h2 className="text-lg font-extrabold mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500" />
            عبارات ومُنى
          </h2>
          <div
            className="flex items-center justify-center min-h-[260px] text-center"
            dir="rtl"
          >
            {state.phrases.length === 0 ? (
              <p className="text-[var(--text-secondary)]">
                لا توجد عبارات. أضف من الإعدادات.
              </p>
            ) : (
              <div
                key={phraseIndex}
                className="phrase-fade font-ruqaa bronze leading-relaxed"
                style={{ fontSize: 'clamp(1.6rem, 3vw, 2.6rem)' }}
              >
                {state.phrases[phraseIndex]}
              </div>
            )}
          </div>
          <div className="flex items-center justify-center gap-1 mt-4">
            {state.phrases.map((_, i) => (
              <span
                key={i}
                className={`pin-dot ${i === phraseIndex ? 'filled' : ''}`}
              />
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Shelf map */}
      <GlassCard className="p-5">
        <h2 className="text-lg font-extrabold mb-3">خريطة الأعمدة</h2>
        <ShelfMap />
      </GlassCard>
    </div>
  );
}
