import React, { useState } from 'react';
import { Grid3x3, Settings2, ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react';
import { SHELF_COLOR_PALETTE } from '../data/mockData.js';
import GlassCard from '../components/GlassCard.jsx';
import ShelfMapComponent from '../components/ShelfMap.jsx';
import { useAstraStore } from '../store/useAstraStore.js';

export default function ShelfMap() {
  const {
    state,
    updateShelfColumn,
    moveShelfColumn,
    addShelfColumn,
    removeShelfColumn,
  } = useAstraStore();
  const [customizing, setCustomizing] = useState(false);

  const columns = [...state.shelfColumns].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Grid3x3 size={20} />
        <h1 className="text-2xl font-extrabold">خريطة الأعمدة</h1>
        <span className="chip chip-cyan">مستقلة</span>
        <button
          type="button"
          onClick={() => setCustomizing((v) => !v)}
          className="ms-auto glass glass-sm px-3 py-1.5 flex items-center gap-2 text-sm font-bold"
        >
          <Settings2 size={16} />
          {customizing ? 'إغلاق التخصيص' : 'تخصيص الأعمدة'}
        </button>
      </div>

      {customizing && (
        <GlassCard className="p-4" strong>
          <div className="space-y-3">
            {columns.map((col, i) => (
              <div
                key={col.id}
                className="glass glass-xs p-3 flex flex-wrap items-center gap-3"
              >
                <input
                  type="text"
                  value={col.label}
                  onChange={(e) => updateShelfColumn(col.id, { label: e.target.value })}
                  className="input flex-1 min-w-[140px]"
                  placeholder="اسم العمود"
                />

                <div className="flex items-center gap-1">
                  {SHELF_COLOR_PALETTE.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => updateShelfColumn(col.id, { color: c })}
                      className="w-6 h-6 rounded-full border-2"
                      style={{
                        backgroundColor: c,
                        borderColor: col.color === c ? 'var(--text-primary)' : 'transparent',
                      }}
                      aria-label={`لون ${c}`}
                    />
                  ))}
                </div>

                <label className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                  صفوف
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={col.rows}
                    onChange={(e) =>
                      updateShelfColumn(col.id, {
                        rows: Math.max(1, Math.min(20, Number(e.target.value) || 1)),
                      })
                    }
                    className="input w-16 !py-1 text-center"
                  />
                </label>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveShelfColumn(col.id, 'up')}
                    disabled={i === 0}
                    className="p-1.5 rounded-lg glass glass-xs disabled:opacity-30"
                    aria-label="نقل لليسار"
                  >
                    <ArrowUp size={14} className="rotate-90" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveShelfColumn(col.id, 'down')}
                    disabled={i === columns.length - 1}
                    className="p-1.5 rounded-lg glass glass-xs disabled:opacity-30"
                    aria-label="نقل لليمين"
                  >
                    <ArrowDown size={14} className="rotate-90" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`حذف ${col.label}؟`)) removeShelfColumn(col.id);
                    }}
                    className="p-1.5 rounded-lg glass glass-xs text-rose-600"
                    aria-label="حذف العمود"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addShelfColumn}
              className="btn-primary w-full flex items-center justify-center gap-2 !py-2"
            >
              <Plus size={16} />
              إضافة عمود جديد
            </button>
          </div>
        </GlassCard>
      )}

      <GlassCard className="p-5" strong>
        <p className="text-sm text-[var(--text-secondary)] mb-3">
          اختر أي صنف من شريط البحث الشامل بالأعلى ليُضيء موقعه على الخريطة، أو
          اضغط على أي عمود يحتوي أصنافاً لعرض كل ما فيه.
        </p>
        <ShelfMapComponent />
      </GlassCard>
    </div>
  );
}
