import React, { useMemo, useState } from 'react';
import { Search, Package, Eye, AlertTriangle } from 'lucide-react';
import GlassCard from '../components/GlassCard.jsx';
import { useAstraStore } from '../store/useAstraStore.js';
import { REORDER_THRESHOLD } from '../data/mockData.js';

export default function Inventory() {
  const { state } = useAstraStore();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all'); // all | low | out

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return state.medicines
      .filter((m) => {
        if (query) {
          const hay = `${m.tradeName} ${m.scientificName} ${m.condition} ${m.company} ${m.country} ${m.shelf} ${m.form} ${m.dose}`.toLowerCase();
          if (!hay.includes(query)) return false;
        }
        if (filter === 'low') return m.qty > 0 && m.qty <= REORDER_THRESHOLD;
        if (filter === 'out') return m.qty === 0;
        return true;
      })
      .sort((a, b) => a.tradeName.localeCompare(b.tradeName, 'ar'));
  }, [state.medicines, q, filter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Package size={20} />
        <h1 className="text-2xl font-extrabold">المخزن</h1>
        <span className="chip chip-cyan">عرض فقط</span>
        <span className="text-sm text-[var(--text-secondary)]">
          ({filtered.length} من {state.medicines.length})
        </span>
      </div>

      <GlassCard className="p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search
              size={16}
              className="absolute top-1/2 -translate-y-1/2 start-3 text-[var(--text-secondary)]"
            />
            <input
              className="input ps-9"
              placeholder="ابحث بالاسم، المرض، البلد، الشركة…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select
            className="select w-auto"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">جميع الأصناف</option>
            <option value="low">منخفض المخزون</option>
            <option value="out">نفد من المخزون</option>
          </select>
          <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
            <Eye size={12} />
            للقراءة فقط — لا يمكن التعديل من هنا
          </span>
        </div>
      </GlassCard>

      <GlassCard className="p-0">
        <div className="glass-table-wrap" style={{ maxHeight: '70vh' }}>
          <table className="glass-table">
            <thead>
              <tr>
                <th>الاسم التجاري</th>
                <th>الاسم العلمي</th>
                <th>الشركة</th>
                <th>البلد</th>
                <th>الشكل</th>
                <th>الجرعة</th>
                <th>التعبئة</th>
                <th>الكمية</th>
                <th>الرف</th>
                <th>الحالة</th>
                <th>المرض</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="text-center py-8 text-[var(--text-secondary)]"
                  >
                    لا توجد نتائج
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id}>
                    <td className="font-semibold">{m.tradeName}</td>
                    <td className="text-sm">{m.scientificName}</td>
                    <td className="text-sm">{m.company}</td>
                    <td className="text-sm">{m.country}</td>
                    <td className="text-sm">{m.form}</td>
                    <td className="text-sm">{m.dose}</td>
                    <td className="text-sm">{m.packSize}</td>
                    <td>
                      <span
                        className={`font-extrabold ${
                          m.qty === 0
                            ? 'text-red-500'
                            : m.qty <= REORDER_THRESHOLD
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {m.qty}
                      </span>
                    </td>
                    <td className="text-sm">{m.shelf}</td>
                    <td>
                      {m.qty === 0 ? (
                        <span className="chip chip-coral">نفد</span>
                      ) : m.qty <= REORDER_THRESHOLD ? (
                        <span className="chip chip-coral">
                          <AlertTriangle size={10} />
                          منخفض
                        </span>
                      ) : (
                        <span className="chip chip-mint">متوفر</span>
                      )}
                    </td>
                    <td className="text-sm">{m.condition}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
