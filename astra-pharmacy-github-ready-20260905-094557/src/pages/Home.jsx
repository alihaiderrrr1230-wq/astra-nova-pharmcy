import React, { useEffect, useMemo, useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  Stethoscope,
  Pencil,
  Save,
  AlertTriangle,
  ArrowUpRight,
  ShoppingCart,
  Check,
} from 'lucide-react';
import GlassCard from '../components/GlassCard.jsx';
import OmniSearch from '../components/OmniSearch.jsx';
import { useAstraStore } from '../store/useAstraStore.js';
import { REORDER_THRESHOLD } from '../data/mockData.js';

// ---------------------------------------------------------------------
// Home — simplified, redesigned:
//  1. A minimal welcome card (name + Hijri + Gregorian dates only).
//  2. A wide pill search bar — the pill shape lives on the <input>
//     itself (see OmniSearch's `omni-search-pill` class), NOT on a
//     wrapping glass container. That wrapper was the actual cause of
//     the stray oval shape behind the results dropdown, so it's gone.
//  3. Best-sellers loop: rotates through the top 20 medicines (last 30
//     days), 4 at a time, every 10 seconds. Clicking a card adds that
//     medicine straight to the POS cart.
//  4. Rotating phrases box.
//  5. Business visibility (low stock + expiry) — moved here from Admin.
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
  const { state, setSettings, addToCart, setHighlighterShelf } = useAstraStore();
  const today = useMemo(() => new Date(), []);

  // Top-selling (last 30 days) — top 20, shown 4 at a time, rotating.
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

  const PAGE_SIZE = 4;
  const pageCount = Math.max(1, Math.ceil(topSelling.length / PAGE_SIZE));
  const [topSellingPage, setTopSellingPage] = useState(0);
  useEffect(() => {
    if (topSelling.length <= PAGE_SIZE) return;
    const interval = setInterval(() => {
      setTopSellingPage((p) => (p + 1) % pageCount);
    }, 10000);
    return () => clearInterval(interval);
  }, [topSelling.length, pageCount]);

  const displayedTopSelling = topSelling.slice(
    topSellingPage * PAGE_SIZE,
    topSellingPage * PAGE_SIZE + PAGE_SIZE
  );

  // Brief "✓ أضيف" confirmation per medicine after a loop click.
  const [justAdded, setJustAdded] = useState(null);
  function handleQuickAdd(med) {
    addToCart(med.id, 1);
    setHighlighterShelf(med.shelf);
    setJustAdded(med.id);
    setTimeout(() => setJustAdded((cur) => (cur === med.id ? null : cur)), 1200);
  }

  // Phrase rotation
  const [phraseIndex, setPhraseIndex] = useState(0);
  useEffect(() => {
    if (state.phrases.length <= 1) return;
    const i = setInterval(() => {
      setPhraseIndex((p) => (p + 1) % state.phrases.length);
    }, 8000);
    return () => clearInterval(i);
  }, [state.phrases.length]);

  // Business visibility — low stock + expiry warnings. Moved here from
  // Admin so the whole team sees it at a glance, no PIN needed.
  const lowStock = useMemo(
    () =>
      state.medicines
        .filter((m) => m.qty <= REORDER_THRESHOLD)
        .sort((a, b) => a.qty - b.qty),
    [state.medicines]
  );

  const expiringSoon = useMemo(() => {
    const now = new Date();
    const horizon = new Date();
    horizon.setMonth(horizon.getMonth() + 6);
    return state.medicines
      .filter((m) => {
        const exp = new Date(m.expiryDate);
        return exp <= horizon && exp >= now;
      })
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  }, [state.medicines]);

  // Facility identity — editable directly from the welcome card.
  const [editingIdentity, setEditingIdentity] = useState(false);
  const [clinicDraft, setClinicDraft] = useState(state.settings.clinicName || '');
  const [managerDraft, setManagerDraft] = useState(state.settings.managerName || '');

  function saveIdentity() {
    setSettings({
      clinicName: clinicDraft.trim() || 'صيدلية أسترا',
      managerName: managerDraft.trim(),
    });
    setEditingIdentity(false);
  }

  return (
    <div className="space-y-5">
      {/* 1) Minimal welcome card */}
      <GlassCard className="p-5" strong>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #0B3D91, #1E5FCC)' }}
            >
              <Stethoscope size={20} className="text-white" strokeWidth={2.2} />
            </div>

            {editingIdentity ? (
              <div className="flex-1 min-w-0 space-y-1.5">
                <input
                  type="text"
                  value={clinicDraft}
                  onChange={(e) => setClinicDraft(e.target.value)}
                  placeholder="اسم الصيدلية / العيادة"
                  className="input !py-1 !text-sm w-full max-w-xs"
                  autoFocus
                />
                <input
                  type="text"
                  value={managerDraft}
                  onChange={(e) => setManagerDraft(e.target.value)}
                  placeholder="اسم المدير / المسؤول (اختياري)"
                  className="input !py-1 !text-xs w-full max-w-xs"
                />
                <button
                  type="button"
                  onClick={saveIdentity}
                  className="btn btn-primary !py-1 !px-2 !text-xs mt-1"
                >
                  <Save size={12} />
                  حفظ
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setClinicDraft(state.settings.clinicName || '');
                  setManagerDraft(state.settings.managerName || '');
                  setEditingIdentity(true);
                }}
                className="text-start group"
                title="اضغط لتعديل اسم المنشأة والمدير"
              >
                <div className="text-lg md:text-xl font-extrabold flex items-center gap-1.5">
                  {state.settings.clinicName || 'صيدلية أسترا'}
                  <Pencil
                    size={13}
                    className="opacity-0 group-hover:opacity-50 transition-opacity"
                  />
                </div>
                {state.settings.managerName && (
                  <div className="text-xs text-[var(--text-secondary)]">
                    المدير: {state.settings.managerName}
                  </div>
                )}
                <div className="text-sm text-[var(--text-secondary)] mt-0.5">
                  {formatGregorian(today)}
                </div>
              </button>
            )}
          </div>
          <div className="text-end">
            <div className="text-xs text-[var(--text-secondary)]">التاريخ الهجري</div>
            <div className="text-base font-bold">{formatHijri(today)}</div>
          </div>
        </div>
      </GlassCard>

      {/* 2) Wide pill search bar — no wrapping glass container anymore */}
      <OmniSearch wide />

      {/* 3) Two loop boxes side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Best sellers — rotates top 20, 4 at a time, every 10s */}
        <GlassCard className="p-5" strong distort>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-extrabold flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-600" />
              الأكثر مبيعاً
            </h2>
            <span className="text-xs text-[var(--text-secondary)]">
              آخر 30 يوم — اضغط لإضافة للكاشير
            </span>
          </div>
          {topSelling.length === 0 ? (
            <div className="text-center py-10 text-[var(--text-secondary)]">
              لا توجد مبيعات مسجلة بعد
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {displayedTopSelling.map((e, i) => (
                  <button
                    type="button"
                    key={e.med.id}
                    onClick={() => handleQuickAdd(e.med)}
                    disabled={e.med.qty <= 0}
                    className="glass glass-xs p-3 flex flex-col gap-1 min-h-[110px] justify-between text-start relative transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                    title={
                      e.med.qty <= 0
                        ? 'نفد من المخزون'
                        : `إضافة ${e.med.tradeName} للسلة`
                    }
                  >
                    {justAdded === e.med.id && (
                      <span className="absolute inset-0 flex items-center justify-center gap-1 rounded-[10px] bg-emerald-600/90 text-white text-xs font-bold z-10">
                        <Check size={14} />
                        أضيف للسلة
                      </span>
                    )}
                    <div>
                      <div className="text-[10px] text-[var(--text-secondary)] uppercase">
                        #{topSellingPage * PAGE_SIZE + i + 1}
                      </div>
                      <div className="font-extrabold text-sm leading-tight truncate">
                        {e.med.tradeName}
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)] truncate">
                        {e.med.condition}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] text-[var(--text-secondary)]">
                        عمود {e.med.shelf}
                      </span>
                      <span className="chip chip-mint !text-xs !px-2 !py-0.5 flex items-center gap-1">
                        <ShoppingCart size={10} />
                        {e.qty}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              {pageCount > 1 && (
                <div className="flex items-center justify-center gap-1 mt-3">
                  {Array.from({ length: pageCount }).map((_, i) => (
                    <span
                      key={i}
                      className={`pin-dot ${i === topSellingPage ? 'filled' : ''}`}
                      style={{ width: 6, height: 6 }}
                    />
                  ))}
                </div>
              )}
            </>
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

      {/* 4) Business visibility — moved here from Admin */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard className="p-5" strong>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-extrabold flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-600" />
              تنبيهات نقص المخزون
            </h2>
            <span className="chip chip-coral">{lowStock.length}</span>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">
              ممتاز! لا توجد أصناف منخفضة حالياً.
            </p>
          ) : (
            <div className="glass-table-wrap" style={{ maxHeight: '60vh' }}>
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>الصنف</th>
                    <th>الكمية</th>
                    <th>العمود</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div className="font-semibold">{m.tradeName}</div>
                        <div className="text-xs text-[var(--text-secondary)]">
                          {m.condition}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`font-extrabold ${
                            m.qty === 0 ? 'text-red-500' : 'text-amber-600'
                          }`}
                        >
                          {m.qty}
                        </span>
                      </td>
                      <td className="text-sm">{m.shelf}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-5" strong>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-extrabold flex items-center gap-2">
              <ArrowUpRight size={18} className="text-violet-600" />
              أدوية قاربت صلاحيتها على الانتهاء
            </h2>
            <span className="chip chip-violet">{expiringSoon.length}</span>
          </div>
          {expiringSoon.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">
              لا توجد صلاحية قاربت خلال 6 أشهر.
            </p>
          ) : (
            <div className="glass-table-wrap" style={{ maxHeight: '60vh' }}>
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>الصنف</th>
                    <th>الصلاحية</th>
                    <th>متبقي</th>
                  </tr>
                </thead>
                <tbody>
                  {expiringSoon.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div className="font-semibold">{m.tradeName}</div>
                        <div className="text-xs text-[var(--text-secondary)]">
                          {m.condition}
                        </div>
                      </td>
                      <td className="text-sm">
                        {new Date(m.expiryDate).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="text-sm">
                        {Math.ceil(
                          (new Date(m.expiryDate) - new Date()) /
                            (1000 * 60 * 60 * 24 * 30)
                        )}{' '}
                        شهراً
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
