import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import GlassCard from './GlassCard.jsx';
import { useAstraStore } from '../store/useAstraStore.js';
import {
  COMPANIES_LIST,
  COUNTRIES_LIST,
  FORMS_LIST,
} from '../data/mockData.js';

// ---------------------------------------------------------------------
// BarcodeModal — opened by the POS when a barcode is scanned that does
// not match any existing medicine. Lets the cashier quickly add a new
// medicine with the bare minimum (trade name, scientific name, dose,
// form, qty, sell price, condition), then automatically adds it to
// the cart. The modal can also be dismissed without saving.
// ---------------------------------------------------------------------
const EMPTY = {
  tradeName: '',
  scientificName: '',
  form: FORMS_LIST[0] ?? '',
  dose: '',
  qty: 1,
  sellPrice: 0,
  condition: '',
  shelf: 'A-1-1',
  company: COMPANIES_LIST[0] ?? '',
  country: COUNTRIES_LIST[0] ?? '',
  prescription: false,
  expiryDate: '',
};

export default function BarcodeModal({ barcode, onClose }) {
  const { addMedicine, addToCart } = useAstraStore();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSave() {
    if (!form.tradeName.trim() || !form.scientificName.trim()) {
      setError('الاسم التجاري والعلمي مطلوبان');
      return;
    }
    addMedicine({
      ...form,
      barcode,
      buyPrice: form.sellPrice * 0.7, // reasonable default
    });
    // The new medicine now exists with the scanned barcode; add to cart
    // by finding it back via the barcode. The store pushed it to the
    // top of the list, so the latest is m.*.
    // We use a microtask to let state update, then look it up.
    setTimeout(() => {
      // Search again by barcode to get the actual id
      const raw = window.localStorage.getItem('astra-pharmacy-state-v1');
      if (raw) {
        const s = JSON.parse(raw);
        const created = s.medicines.find((m) => m.barcode === barcode);
        if (created) {
          addToCart(created.id, Math.max(1, Number(form.qty) || 1));
        }
      }
      onClose?.();
    }, 50);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="صنف جديد"
    >
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <GlassCard
        className="relative max-w-lg w-full p-5"
        strong
        style={{ zIndex: 1 }}
      >
        <button
          type="button"
          onClick={onClose}
          className="btn btn-ghost absolute top-3 end-3 p-2"
          aria-label="إغلاق"
        >
          <X size={16} />
        </button>

        <h2 className="text-xl font-extrabold mb-1 flex items-center gap-2">
          <Plus size={20} className="text-emerald-600" />
          صنف غير مسجّل
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4 flex items-center gap-2">
          <AlertCircle size={14} className="text-amber-500" />
          الباركود <span className="font-mono font-bold">{barcode}</span> غير
          مسجّل. أضف بيانات الصنف الجديدة ليُحفظ ويُضاف للسلة تلقائياً.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-1 block">
              الاسم التجاري
            </label>
            <input
              className="input"
              value={form.tradeName}
              onChange={(e) => setField('tradeName', e.target.value)}
              autoFocus
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
            />
          </div>
          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-1 block">
              الشكل
            </label>
            <input
              list="forms-q"
              className="input"
              value={form.form}
              onChange={(e) => setField('form', e.target.value)}
            />
            <datalist id="forms-q">
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
              الكمية
            </label>
            <input
              type="number"
              min="1"
              className="input"
              value={form.qty}
              onChange={(e) =>
                setField('qty', Math.max(1, Number(e.target.value) || 1))
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
                setField('sellPrice', Math.max(0, Number(e.target.value) || 0))
              }
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 mt-3">{error}</p>
        )}

        <div className="mt-5 flex items-center gap-2 justify-end">
          <button type="button" onClick={onClose} className="btn">
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn btn-primary"
          >
            <Plus size={16} />
            حفظ وإضافة للسلة
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
