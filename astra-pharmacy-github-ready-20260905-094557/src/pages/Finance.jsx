import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Trash2,
  Calendar,
} from 'lucide-react';
import GlassCard from '../components/GlassCard.jsx';
import { useAstraStore } from '../store/useAstraStore.js';
import { formatIQD } from '../utils/format.js';

const RANGES = [
  { id: 'day', label: 'يومي' },
  { id: 'week', label: 'أسبوعي' },
  { id: 'month', label: 'شهري' },
  { id: 'year', label: 'سنوي' },
];

function inRange(iso, range) {
  const d = new Date(iso);
  const now = new Date();
  const ms = now - d;
  if (range === 'day') return ms < 1000 * 60 * 60 * 24;
  if (range === 'week') return ms < 1000 * 60 * 60 * 24 * 7;
  if (range === 'month') return ms < 1000 * 60 * 60 * 24 * 30;
  if (range === 'year') return ms < 1000 * 60 * 60 * 24 * 365;
  return true;
}

export default function Finance() {
  const { state, addExpense, removeExpense, addDebt, removeDebt } = useAstraStore();
  const [range, setRange] = useState('week');
  const [expForm, setExpForm] = useState({ label: '', amount: 0, category: 'مرافق' });
  const [dbtForm, setDbtForm] = useState({ distributorId: '', label: '', amount: 0 });

  // ---- Calculations ----
  const stats = useMemo(() => {
    const filteredSales = state.salesLog.filter((s) => inRange(s.timestamp, range));
    const filteredExpenses = state.expenses.filter((e) => inRange(e.date, range));
    const filteredDebts = state.debts.filter((d) => inRange(d.date, range));

    const sales = filteredSales.reduce((s, l) => s + l.qty * l.unitPrice, 0);
    const cogs = filteredSales.reduce((s, l) => s + l.qty * l.unitCost, 0);
    const salaries = state.employees
      .filter((e) => e.hireDate && new Date(e.hireDate) <= new Date())
      .reduce((s, e) => {
        // Prorate salary by the range fraction of a month
        const fraction = range === 'day' ? 1 / 30 : range === 'week' ? 7 / 30 : range === 'month' ? 1 : 12;
        return s + e.salary * fraction;
      }, 0);
    const expenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);
    const wastage = filteredExpenses
      .filter((e) => e.category === 'هالك')
      .reduce((s, e) => s + e.amount, 0);
    const distributorDebts = filteredDebts.reduce((s, d) => s + d.amount, 0);

    // Losses from medicines that are ALREADY expired (still in stock but
    // past their expiry date). These have to be written off as loss.
    const now = new Date();
    const expiredStockLoss = state.medicines
      .filter((m) => m.expiryDate && new Date(m.expiryDate) < now && m.qty > 0)
      .reduce((s, m) => s + m.qty * m.buyPrice, 0);

    // Count of distinct expired items (for the chip in the UI)
    const expiredItemsCount = state.medicines.filter(
      (m) => m.expiryDate && new Date(m.expiryDate) < now && m.qty > 0
    ).length;

    const purchases = cogs + distributorDebts;
    const totalOut = purchases + salaries + expenses + wastage + expiredStockLoss;
    const netProfit = sales - totalOut;

    return {
      sales,
      purchases,
      cogs,
      salaries,
      expenses,
      wastage,
      distributorDebts,
      expiredStockLoss,
      expiredItemsCount,
      totalOut,
      netProfit,
      salesCount: filteredSales.length,
    };
  }, [state, range]);

  // Now for the expired-stock section (used in the JSX below)
  const now = new Date();

  // Detailed list of expired-stock items for the losses section
  const expiredStockItems = useMemo(() => {
    const now = new Date();
    return state.medicines
      .filter(
        (m) => m.expiryDate && new Date(m.expiryDate) < now && m.qty > 0
      )
      .map((m) => ({
        ...m,
        lossValue: m.qty * m.buyPrice,
      }))
      .sort((a, b) => b.lossValue - a.lossValue);
  }, [state.medicines]);

  function handleAddExp(e) {
    e.preventDefault();
    if (!expForm.label.trim() || !expForm.amount) return;
    addExpense({
      ...expForm,
      amount: Number(expForm.amount),
      date: new Date().toISOString(),
    });
    setExpForm({ label: '', amount: 0, category: 'مرافق' });
  }

  function handleAddDebt(e) {
    e.preventDefault();
    if (!dbtForm.distributorId || !dbtForm.amount) return;
    addDebt({
      ...dbtForm,
      amount: Number(dbtForm.amount),
      date: new Date().toISOString(),
    });
    setDbtForm({ distributorId: '', label: '', amount: 0 });
  }

  const distributorName = (id) =>
    state.distributors.find((d) => d.id === id)?.name ?? '—';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Wallet size={20} />
        <h1 className="text-2xl font-extrabold">الحسابات والجرد</h1>
        <span className="chip chip-violet">وضع الإدارة</span>
      </div>

      {/* Range selector */}
      <GlassCard className="p-2">
        <div className="flex items-center gap-1 flex-wrap">
          <Calendar size={16} className="ms-2 text-[var(--text-secondary)]" />
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRange(r.id)}
              className={`px-3 py-1.5 rounded-[12px] text-sm font-semibold ${
                range === r.id
                  ? 'glass-strong'
                  : 'bg-white/15 hover:bg-white/30'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-5" strong>
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-1">
            <TrendingUp size={14} className="text-emerald-600" />
            إجمالي المبيعات
          </div>
          <div className="text-2xl font-extrabold">{formatIQD(stats.sales)}</div>
          <div className="text-xs text-[var(--text-secondary)]">
            {stats.salesCount} عملية بيع
          </div>
        </GlassCard>
        <GlassCard className="p-5" strong>
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-1">
            <TrendingDown size={14} className="text-red-500" />
            المصروفات الإجمالية
          </div>
          <div className="text-2xl font-extrabold">{formatIQD(stats.totalOut)}</div>
          <div className="text-xs text-[var(--text-secondary)]">
            مشتريات + رواتب + مصاريف
          </div>
        </GlassCard>
        <GlassCard className="p-5" strong>
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-1">
            <Wallet size={14} className="text-violet-600" />
            صافي الربح
          </div>
          <div
            className={`text-2xl font-extrabold ${
              stats.netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'
            }`}
          >
            {formatIQD(stats.netProfit)}
          </div>
          <div className="text-xs text-[var(--text-secondary)]">
            هامش: {stats.sales > 0 ? ((stats.netProfit / stats.sales) * 100).toFixed(1) : 0}%
          </div>
        </GlassCard>
        <GlassCard className="p-5" strong>
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-1">
            <TrendingDown size={14} className="text-amber-600" />
            تكلفة البضاعة المباعة
          </div>
          <div className="text-2xl font-extrabold">{formatIQD(stats.cogs)}</div>
          <div className="text-xs text-[var(--text-secondary)]">
            قيمة الشراء للمنبع
          </div>
        </GlassCard>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <h2 className="text-lg font-extrabold mb-3">تفاصيل المصروفات</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between">
              <span>تكلفة البضاعة (COGS)</span>
              <b>{formatIQD(stats.cogs)}</b>
            </li>
            <li className="flex items-center justify-between">
              <span>مستحقات الموزعين</span>
              <b>{formatIQD(stats.distributorDebts)}</b>
            </li>
            <li className="flex items-center justify-between">
              <span>الرواتب</span>
              <b>{formatIQD(stats.salaries)}</b>
            </li>
            <li className="flex items-center justify-between">
              <span>مصاريف تشغيلية</span>
              <b>{formatIQD(stats.expenses - stats.wastage)}</b>
            </li>
            <li className="flex items-center justify-between">
              <span>هالك وتالف مُسجّل</span>
              <b>{formatIQD(stats.wastage)}</b>
            </li>
            <li className="flex items-center justify-between text-red-500">
              <span>
                قيمة أدوية انتهت صلاحيتها
                <span className="text-[11px] text-[var(--text-secondary)] ms-1">
                  ({stats.expiredItemsCount} صنف)
                </span>
              </span>
              <b>{formatIQD(stats.expiredStockLoss)}</b>
            </li>
            <li className="flex items-center justify-between border-t border-[var(--glass-border)] pt-2 font-extrabold">
              <span>إجمالي الخصومات</span>
              <b>{formatIQD(stats.totalOut)}</b>
            </li>
          </ul>
        </GlassCard>

        <GlassCard className="p-5">
          <h2 className="text-lg font-extrabold mb-3">ملخص الفترة</h2>
          <div className="text-sm space-y-2">
            <div className="flex items-center justify-between">
              <span>المبيعات</span>
              <b className="text-emerald-600">+{formatIQD(stats.sales)}</b>
            </div>
            <div className="flex items-center justify-between">
              <span>إجمالي المصروفات</span>
              <b className="text-red-500">-{formatIQD(stats.totalOut)}</b>
            </div>
            <div className="flex items-center justify-between text-lg font-extrabold border-t border-[var(--glass-border)] pt-2">
              <span>الصافي</span>
              <span
                className={
                  stats.netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'
                }
              >
                {formatIQD(stats.netProfit)}
              </span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Losses from expired medicines — explicit, clear breakdown */}
      <GlassCard className="p-5" strong>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-lg font-extrabold flex items-center gap-2">
            <span className="text-red-500">💸</span>
            خسائر الأدوية التي انتهت صلاحيتها
          </h2>
          {stats.expiredItemsCount > 0 && (
            <span className="chip chip-coral">
              {stats.expiredItemsCount} صنف منتهي
            </span>
          )}
        </div>
        <p className="text-sm text-[var(--text-secondary)] mb-3">
          الأدوية التي تجاوزت تاريخ صلاحيتها ولم تُبع بعد. قيمة خسارتها
          تُحتسب بسعر الشراء، وتُخصم من صافي الربح تلقائياً.
        </p>
        {expiredStockItems.length === 0 ? (
          <p className="text-sm text-emerald-600 font-semibold">
            ✓ ممتاز! ما عندك أدوية منتهية الصلاحية بالمخزون.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="glass glass-xs p-3">
                <div className="text-[11px] text-[var(--text-secondary)]">
                  عدد الأصناف
                </div>
                <div className="text-xl font-extrabold text-red-500">
                  {expiredStockItems.length}
                </div>
              </div>
              <div className="glass glass-xs p-3">
                <div className="text-[11px] text-[var(--text-secondary)]">
                  إجمالي الوحدات
                </div>
                <div className="text-xl font-extrabold text-red-500">
                  {expiredStockItems.reduce((s, m) => s + m.qty, 0)}
                </div>
              </div>
              <div className="glass glass-xs p-3">
                <div className="text-[11px] text-[var(--text-secondary)]">
                  إجمالي الخسارة (بسعر الشراء)
                </div>
                <div className="text-xl font-extrabold text-red-500">
                  {formatIQD(stats.expiredStockLoss)}
                </div>
              </div>
            </div>
            <div className="glass-table-wrap" style={{ maxHeight: '40vh' }}>
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>الصنف</th>
                    <th>الكمية</th>
                    <th>سعر الشراء</th>
                    <th>قيمة الخسارة</th>
                    <th>انتهت منذ</th>
                  </tr>
                </thead>
                <tbody>
                  {expiredStockItems.map((m) => {
                    const daysSince = Math.floor(
                      (now - new Date(m.expiryDate)) / (1000 * 60 * 60 * 24)
                    );
                    return (
                      <tr key={m.id}>
                        <td>
                          <div className="font-semibold">{m.tradeName}</div>
                          <div className="text-xs text-[var(--text-secondary)]">
                            {m.condition}
                          </div>
                        </td>
                        <td className="font-extrabold text-red-500">{m.qty}</td>
                        <td>{formatIQD(m.buyPrice)}</td>
                        <td className="font-extrabold text-red-500">
                          {formatIQD(m.lossValue)}
                        </td>
                        <td className="text-xs text-[var(--text-secondary)]">
                          {daysSince} يوم
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </GlassCard>

      {/* Add expense + Add debt */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard className="p-5" strong>
          <h2 className="text-lg font-extrabold mb-3">إضافة مصروف</h2>
          <form onSubmit={handleAddExp} className="space-y-2">
            <input
              className="input"
              placeholder="وصف المصروف"
              value={expForm.label}
              onChange={(e) => setExpForm({ ...expForm, label: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="0"
                step="0.01"
                className="input"
                placeholder="المبلغ"
                value={expForm.amount || ''}
                onChange={(e) =>
                  setExpForm({ ...expForm, amount: Number(e.target.value) || 0 })
                }
              />
              <select
                className="select"
                value={expForm.category}
                onChange={(e) => setExpForm({ ...expForm, category: e.target.value })}
              >
                <option>مرافق</option>
                <option>إيجار</option>
                <option>مستلزمات</option>
                <option>صيانة</option>
                <option>هالك</option>
                <option>أخرى</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary w-full">
              <Plus size={16} />
              إضافة
            </button>
          </form>

          <h3 className="text-sm font-bold mt-5 mb-2 text-[var(--text-secondary)]">
            المصروفات المسجلة
          </h3>
          <ul className="space-y-1 max-h-48 overflow-auto">
            {state.expenses.length === 0 ? (
              <li className="text-sm text-[var(--text-secondary)]">
                لا توجد مصروفات
              </li>
            ) : (
              state.expenses.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between gap-2 text-sm py-1"
                >
                  <div className="flex-1 min-w-0 truncate">
                    {e.label}{' '}
                    <span className="text-[var(--text-secondary)] text-xs">
                      ({e.category})
                    </span>
                  </div>
                  <b className="whitespace-nowrap">{formatIQD(e.amount)}</b>
                  <button
                    type="button"
                    onClick={() => removeExpense(e.id)}
                    className="btn btn-ghost !p-1"
                    title="حذف"
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </li>
              ))
            )}
          </ul>
        </GlassCard>

        <GlassCard className="p-5" strong>
          <h2 className="text-lg font-extrabold mb-3">إضافة دين موزع</h2>
          <form onSubmit={handleAddDebt} className="space-y-2">
            <select
              className="select"
              value={dbtForm.distributorId}
              onChange={(e) =>
                setDbtForm({ ...dbtForm, distributorId: e.target.value })
              }
            >
              <option value="">— اختر الموزع —</option>
              {state.distributors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.currency})
                </option>
              ))}
            </select>
            <input
              className="input"
              placeholder="وصف (فاتورة، طلب…)"
              value={dbtForm.label}
              onChange={(e) => setDbtForm({ ...dbtForm, label: e.target.value })}
            />
            <input
              type="number"
              min="0"
              step="0.01"
              className="input"
              placeholder="المبلغ"
              value={dbtForm.amount || ''}
              onChange={(e) =>
                setDbtForm({ ...dbtForm, amount: Number(e.target.value) || 0 })
              }
            />
            <button type="submit" className="btn btn-primary w-full">
              <Plus size={16} />
              إضافة
            </button>
          </form>

          <h3 className="text-sm font-bold mt-5 mb-2 text-[var(--text-secondary)]">
            الديون الحالية
          </h3>
          <ul className="space-y-1 max-h-48 overflow-auto">
            {state.debts.length === 0 ? (
              <li className="text-sm text-[var(--text-secondary)]">
                لا توجد ديون مسجلة
              </li>
            ) : (
              state.debts.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between gap-2 text-sm py-1"
                >
                  <div className="flex-1 min-w-0 truncate">
                    {distributorName(d.distributorId)} — {d.label}
                  </div>
                  <b className="whitespace-nowrap">{formatIQD(d.amount)}</b>
                  <button
                    type="button"
                    onClick={() => removeDebt(d.id)}
                    className="btn btn-ghost !p-1"
                    title="حذف"
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </li>
              ))
            )}
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}
