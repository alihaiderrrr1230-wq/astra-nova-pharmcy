import React, { useState, useMemo } from 'react';
import {
  Plus,
  Save,
  Trash2,
  Edit3,
  Printer,
  ClipboardList,
  X,
  Package,
  CheckCircle2,
  Undo2,
} from 'lucide-react';
import GlassCard from '../components/GlassCard.jsx';
import { useAstraStore } from '../store/useAstraStore.js';
import {
  REORDER_THRESHOLD,
  COMPANIES_LIST,
  COUNTRIES_LIST,
  FORMS_LIST,
  WAREHOUSES_LIST,
  SALES_REPS_LIST,
} from '../data/mockData.js';
import { formatIQD, formatDate } from '../utils/format.js';

const EMPTY_FORM = {
  barcode: '',
  tradeName: '',
  scientificName: '',
  company: COMPANIES_LIST[0] ?? '',
  country: COUNTRIES_LIST[0] ?? '',
  form: FORMS_LIST[0] ?? '',
  dose: '',
  packSize: '',
  qty: 0,
  buyPrice: 0,
  sellPrice: 0,
  condition: '',
  shelf: 'A-1-1',
  prescription: false,
  expiryDate: '',
};

export default function StoreManagement() {
  const {
    state,
    addMedicine,
    updateMedicine,
    deleteMedicine,
  } = useAstraStore();

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [feedback, setFeedback] = useState('');

  // ----- Form helpers -----
  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  const profit = useMemo(() => {
    const amount = (form.sellPrice || 0) - (form.buyPrice || 0);
    const pct = form.buyPrice > 0 ? (amount / form.buyPrice) * 100 : 0;
    return { amount, pct };
  }, [form.buyPrice, form.sellPrice]);

  function handleSubmit(e) {
    e?.preventDefault?.();
    if (!form.tradeName.trim() || !form.scientificName.trim()) {
      setFeedback('الاسم التجاري والعلمي مطلوبان');
      return;
    }
    if (editingId) {
      updateMedicine(editingId, { ...form });
      setFeedback(`تم تحديث "${form.tradeName}"`);
    } else {
      addMedicine({ ...form });
      setFeedback(`تم إضافة "${form.tradeName}"`);
    }
    setForm(EMPTY_FORM);
    setEditingId(null);
    setTimeout(() => setFeedback(''), 2500);
  }

  function handleEdit(m) {
    setEditingId(m.id);
    setForm({ ...m });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleDelete(m) {
    if (confirm(`حذف "${m.tradeName}"؟`)) {
      deleteMedicine(m.id);
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  // ----- NPS (Needs Procurement Sheet) — editable -----
  // Each medicine in the needs list has editable qty (via setNpsQty) and
  // an "ordered" flag (via markNpsOrdered). The state is keyed by
  // medicineId and stored in its own localStorage key.
  const { nps, setNpsQty, markNpsOrdered, resetNps } = useAstraStore();
  const [showOrdered, setShowOrdered] = useState(false);

  const needsList = useMemo(() => {
    return state.medicines
      .filter((m) => m.qty <= REORDER_THRESHOLD)
      .map((m) => {
        const entry = nps[m.id] || {};
        const defaultQty = Math.max(20, REORDER_THRESHOLD * 3 - m.qty);
        return {
          ...m,
          reorderQty:
            entry.qty != null && entry.qty !== 0 ? entry.qty : defaultQty,
          ordered: !!entry.ordered,
          orderedAt: entry.orderedAt,
        };
      })
      .sort((a, b) => a.qty - b.qty);
  }, [state.medicines, nps]);

  const activeNeeds = needsList.filter((m) => !m.ordered);
  const orderedItems = needsList.filter((m) => m.ordered);

  function printNeedsList() {
    const w = window.open('', '_blank', 'width=600,height=800');
    const rows = needsList
      .map(
        (m, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${m.tradeName}</td>
          <td>${m.scientificName}</td>
          <td>${m.company}</td>
          <td>${m.packSize}</td>
          <td style="text-align:center">${m.qty}</td>
          <td style="text-align:center">${m.reorderQty}</td>
        </tr>`
      )
      .join('');
    const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<title>قائمة الاحتياجات (NPS)</title>
<style>
  body { font-family: 'Cairo', sans-serif; padding: 16px; color: #1b2432; }
  h1 { text-align: center; margin: 0 0 8px; }
  .meta { text-align: center; color: #5b6b85; margin-bottom: 12px; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { padding: 6px 8px; border-bottom: 1px solid #ddd; }
  th { background: #f5f7fa; }
  @media print { .no-print { display: none; } }
</style>
</head>
<body>
  <h1>قائمة الاحتياجات — صيدلية أسترا</h1>
  <div class="meta">NPS — تاريخ الإصدار: ${new Date().toLocaleDateString('ar-EG')}</div>
  <table>
    <thead>
      <tr>
        <th>#</th><th>الاسم التجاري</th><th>الاسم العلمي</th>
        <th>الشركة</th><th>التعبئة</th><th>المتوفر</th><th>المطلوب طلبه</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <p style="margin-top:14px;font-size:12px;color:#5b6b85">
    هذه القائمة للأصناف المنخفضة فقط (بدون أسعار) — للتسليم للموزع.
  </p>
  <div class="no-print" style="text-align:center;margin-top:14px">
    <button onclick="window.print()">طباعة</button>
  </div>
</body>
</html>`;
    w.document.write(html);
    w.document.close();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Package size={20} />
        <h1 className="text-2xl font-extrabold">إدارة المتجر</h1>
        <span className="chip chip-violet">وضع الإدارة</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Form */}
        <GlassCard className="p-5 lg:col-span-2" strong>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold flex items-center gap-2">
              {editingId ? <Edit3 size={18} /> : <Plus size={18} />}
              {editingId ? 'تعديل صنف' : 'إضافة صنف جديد'}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="btn btn-ghost"
              >
                <X size={14} />
                إلغاء
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs text-[var(--text-secondary)] mb-1 block">
                الباركود
              </label>
              <input
                name="barcodeField"
                className="input font-mono"
                value={form.barcode ?? ''}
                onChange={(e) => setField('barcode', e.target.value)}
                placeholder="امسح بالجهاز أو اكتب الرقم — 12-13 رقم"
                dir="ltr"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1 block">
                الاسم التجاري
              </label>
              <input
                className="input"
                value={form.tradeName}
                onChange={(e) => setField('tradeName', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1 block">
                الاسم العلمي
              </label>
              <input
                className="input"
                value={form.scientificName}
                onChange={(e) => setField('scientificName', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1 block">
                الشركة
              </label>
              <input
                list="companies"
                className="input"
                value={form.company}
                onChange={(e) => setField('company', e.target.value)}
              />
              <datalist id="companies">
                {COMPANIES_LIST.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1 block">
                بلد المنشأ
              </label>
              <input
                list="countries"
                className="input"
                value={form.country}
                onChange={(e) => setField('country', e.target.value)}
              />
              <datalist id="countries">
                {COUNTRIES_LIST.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1 block">
                الشكل
              </label>
              <input
                list="forms"
                className="input"
                value={form.form}
                onChange={(e) => setField('form', e.target.value)}
              />
              <datalist id="forms">
                {FORMS_LIST.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1 block">
                الجرعة
              </label>
              <input
                className="input"
                value={form.dose}
                onChange={(e) => setField('dose', e.target.value)}
                placeholder="500mg"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1 block">
                التعبئة
              </label>
              <input
                className="input"
                value={form.packSize}
                onChange={(e) => setField('packSize', e.target.value)}
                placeholder="20 قرص"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1 block">
                الكمية
              </label>
              <input
                type="number"
                min="0"
                className="input"
                value={form.qty}
                onChange={(e) => setField('qty', Math.max(0, Number(e.target.value)))}
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1 block">
                سعر الشراء
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input"
                value={form.buyPrice}
                onChange={(e) =>
                  setField('buyPrice', Math.max(0, Number(e.target.value)))
                }
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1 block">
                سعر البيع
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input"
                value={form.sellPrice}
                onChange={(e) =>
                  setField('sellPrice', Math.max(0, Number(e.target.value)))
                }
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1 block">
                المرض / الاستخدام
              </label>
              <input
                className="input"
                value={form.condition}
                onChange={(e) => setField('condition', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1 block">
                موقع الرف
              </label>
              <input
                className="input"
                value={form.shelf}
                onChange={(e) => setField('shelf', e.target.value)}
                placeholder="A-1-1"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1 block">
                المخزن
              </label>
              <input
                list="warehouses"
                className="input"
                value={form.warehouse ?? ''}
                onChange={(e) => setField('warehouse', e.target.value)}
              />
              <datalist id="warehouses">
                {WAREHOUSES_LIST.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1 block">
                المندوب
              </label>
              <input
                list="reps"
                className="input"
                value={form.salesRep ?? ''}
                onChange={(e) => setField('salesRep', e.target.value)}
              />
              <datalist id="reps">
                {SALES_REPS_LIST.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-1 block">
                تاريخ الصلاحية
              </label>
              <input
                type="date"
                className="input"
                value={form.expiryDate ? form.expiryDate.slice(0, 10) : ''}
                onChange={(e) =>
                  setField(
                    'expiryDate',
                    e.target.value ? new Date(e.target.value).toISOString() : ''
                  )
                }
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                id="rxFlag"
                type="checkbox"
                checked={!!form.prescription}
                onChange={(e) => setField('prescription', e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="rxFlag" className="text-sm">
                يتطلب وصفة طبية
              </label>
            </div>

            {/* Live profit */}
            <div className="md:col-span-2">
              <div className="glass glass-xs p-3 flex items-center justify-between flex-wrap gap-2">
                <span className="text-sm text-[var(--text-secondary)]">
                  هامش الربح المحسوب
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-sm">
                    المبلغ:{' '}
                    <b className={profit.amount >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                      {formatIQD(profit.amount)}
                    </b>
                  </span>
                  <span className="text-sm">
                    النسبة:{' '}
                    <b className={profit.pct >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                      {profit.pct.toFixed(1)}%
                    </b>
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
              <button type="submit" className="btn btn-primary">
                {editingId ? <Save size={16} /> : <Plus size={16} />}
                {editingId ? 'حفظ التعديلات' : 'إضافة الصنف'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="btn"
                >
                  إلغاء
                </button>
              )}
              {feedback && (
                <span className="text-sm text-emerald-600 font-semibold">
                  {feedback}
                </span>
              )}
            </div>
          </form>
        </GlassCard>

        {/* NPS — editable needs list */}
        <GlassCard className="p-5" strong>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="text-lg font-extrabold flex items-center gap-2">
              <ClipboardList size={18} />
              قائمة الاحتياجات (NPS)
            </h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowOrdered((v) => !v)}
                className={`btn !py-1 !px-2 !text-xs ${
                  showOrdered ? 'btn-primary' : ''
                }`}
                title="عرض/إخفاء الأصناف التي تم طلبها"
              >
                تم الطلب ({orderedItems.length})
              </button>
              {activeNeeds.length > 0 && (
                <button
                  type="button"
                  onClick={printNeedsList}
                  className="btn !py-1 !px-2 !text-xs"
                  title="طباعة القائمة النشطة فقط"
                >
                  <Printer size={12} />
                  طباعة
                </button>
              )}
            </div>
          </div>

          <p className="text-sm text-[var(--text-secondary)] mb-3">
            {activeNeeds.length} صنف نشط بانتظار الطلب
          </p>

          <div className="space-y-2 max-h-96 overflow-auto">
            {activeNeeds.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)]">
                ممتاز! المخزون في حالة جيدة.
              </p>
            ) : (
              activeNeeds.map((m) => (
                <div
                  key={m.id}
                  className="glass glass-xs p-2 flex items-center gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {m.tradeName}
                    </div>
                    <div className="text-[11px] text-[var(--text-secondary)] truncate">
                      {m.condition} • متوفر {m.qty}
                    </div>
                  </div>
                  <label className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1">
                    <span>طلب</span>
                    <input
                      type="number"
                      min="0"
                      className="input !py-1 !px-2 w-16 text-center"
                      value={m.reorderQty}
                      onChange={(e) =>
                        setNpsQty(m.id, Math.max(0, Number(e.target.value) || 0))
                      }
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => markNpsOrdered(m.id, true)}
                    className="btn btn-primary !py-1 !px-2 !text-xs"
                    title="تعليم كـ 'تم الطلب'"
                  >
                    <CheckCircle2 size={12} />
                    تم
                  </button>
                </div>
              ))
            )}
          </div>

          {showOrdered && orderedItems.length > 0 && (
            <div className="mt-4 pt-3 border-t border-[var(--glass-border)]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-extrabold text-[var(--text-secondary)]">
                  تم طلبها ({orderedItems.length})
                </h3>
                <button
                  type="button"
                  onClick={resetNps}
                  className="btn btn-ghost !py-0.5 !px-2 !text-[11px]"
                  title="مسح جميع علامات الطلب"
                >
                  مسح الكل
                </button>
              </div>
              <div className="space-y-1 max-h-48 overflow-auto">
                {orderedItems.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2 text-sm py-1 px-2 opacity-70"
                  >
                    <CheckCircle2
                      size={12}
                      className="text-emerald-600 shrink-0"
                    />
                    <div className="flex-1 min-w-0 truncate">
                      {m.tradeName}{' '}
                      <span className="text-[var(--text-secondary)] text-[11px]">
                        ({m.reorderQty} وحدة)
                      </span>
                    </div>
                    <span className="text-[10px] text-[var(--text-secondary)] shrink-0">
                      {m.orderedAt
                        ? new Date(m.orderedAt).toLocaleDateString('ar-IQ')
                        : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => markNpsOrdered(m.id, false)}
                      className="btn btn-ghost !p-0.5"
                      title="إرجاع للقائمة النشطة"
                    >
                      <Undo2 size={12} className="text-violet-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Existing medicines table */}
      <GlassCard className="p-0">
        <div className="p-4 flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-extrabold">الأصناف المسجلة</h2>
          <span className="text-sm text-[var(--text-secondary)]">
            {state.medicines.length} صنف
          </span>
        </div>
        <div className="glass-table-wrap" style={{ maxHeight: '60vh' }}>
          <table className="glass-table">
            <thead>
              <tr>
                <th>الباركود</th>
                <th>الاسم</th>
                <th>الشكل / الجرعة</th>
                <th>الكمية</th>
                <th>سعر البيع</th>
                <th>الرف</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {state.medicines.map((m) => (
                <tr key={m.id}>
                  <td className="font-mono text-xs">{m.barcode || '—'}</td>
                  <td>
                    <div className="font-semibold">{m.tradeName}</div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      {m.scientificName}
                    </div>
                  </td>
                  <td className="text-sm">
                    {m.form} • {m.dose}
                  </td>
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
                  <td>{formatIQD(m.sellPrice)}</td>
                  <td>{m.shelf}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(m)}
                        className="btn btn-ghost !p-1"
                        aria-label="تعديل"
                        title="تعديل"
                      >
                        <Edit3 size={16} className="text-violet-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(m)}
                        className="btn btn-ghost !p-1"
                        aria-label="حذف"
                        title="حذف"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
