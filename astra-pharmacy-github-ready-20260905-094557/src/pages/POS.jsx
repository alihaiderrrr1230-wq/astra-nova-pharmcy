import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Plus,
  Minus,
  Trash2,
  ScanLine,
  Printer,
  CheckCircle2,
  ShoppingCart,
  User,
  AlertCircle,
  Barcode,
} from 'lucide-react';
import GlassCard from '../components/GlassCard.jsx';
import BarcodeModal from '../components/BarcodeModal.jsx';
import { useAstraStore } from '../store/useAstraStore.js';
import { formatIQD } from '../utils/format.js';

export default function POS() {
  const {
    state,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    checkout,
    setHighlighterShelf,
  } = useAstraStore();

  const [patient, setPatient] = useState('');
  const [error, setError] = useState('');
  const [lastReceipt, setLastReceipt] = useState(null);
  const [pendingBarcode, setPendingBarcode] = useState(null);
  const [scanFlash, setScanFlash] = useState(false);
  const scanInputRef = useRef(null);

  // Keep the scanner input focused so a USB/Bluetooth barcode reader
  // (which behaves like a keyboard) can always write into it.
  useEffect(() => {
    function refocus() {
      // Don't steal focus from a typing input
      const el = document.activeElement;
      const isInput =
        el &&
        (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT');
      if (!isInput) {
        scanInputRef.current?.focus();
      }
    }
    window.addEventListener('click', refocus);
    window.addEventListener('keydown', refocus);
    refocus();
    return () => {
      window.removeEventListener('click', refocus);
      window.removeEventListener('keydown', refocus);
    };
  }, []);

  // Medicines currently in the cart that are prescription/injectable
  const prescriptionRequired = useMemo(() => {
    const map = {};
    for (const c of state.cart) {
      const med = state.medicines.find((m) => m.id === c.medicineId);
      if (med && (med.prescription || /inject|حقن|إبر/i.test(med.form))) {
        map[c.medicineId] = true;
      }
    }
    return map;
  }, [state.cart, state.medicines]);

  const lines = useMemo(() => {
    return state.cart
      .map((c) => {
        const med = state.medicines.find((m) => m.id === c.medicineId);
        if (!med) return null;
        return {
          cartId: c.id,
          med,
          qty: c.qty,
          unitPrice: c.unitPrice,
          lineTotal: c.qty * c.unitPrice,
        };
      })
      .filter(Boolean);
  }, [state.cart, state.medicines]);

  const total = lines.reduce((s, l) => s + l.lineTotal, 0);
  const needsPatient = Object.keys(prescriptionRequired).length > 0;

  function handleBarcodeSubmit(e) {
    e?.preventDefault?.();
    const code = e?.target?.barcode?.value?.trim();
    if (!code) return;
    const med = state.medicines.find(
      (m) => (m.barcode || '').trim() === code
    );
    setScanFlash(true);
    setTimeout(() => setScanFlash(false), 400);
    if (med) {
      addToCart(med.id, 1);
      setHighlighterShelf(med.shelf);
      setError('');
    } else {
      setPendingBarcode(code);
    }
    e.target.barcode.value = '';
  }

  function handleNewMedicineAdded(med) {
    // Auto-added to cart by the modal itself
    if (med && med.shelf) setHighlighterShelf(med.shelf);
  }

  function handleCompleteSale() {
    if (state.cart.length === 0) {
      setError('السلة فارغة');
      return;
    }
    if (needsPatient && !patient.trim()) {
      setError('يجب إدخال اسم المريض لأدوية الوصفة');
      return;
    }
    const r = checkout({ patient, prescriptionMap: prescriptionRequired });
    if (r) {
      setLastReceipt(r);
      setPatient('');
      setError('');
    }
  }

  function printInvoice(receipt) {
    const r = receipt || lastReceipt;
    if (!r) return;
    const w = window.open('', '_blank', 'width=420,height=700');
    const itemsHtml = r.lines
      .map(
        (l) => `
        <tr>
          <td>${l.name}</td>
          <td style="text-align:center">${l.qty}</td>
          <td style="text-align:end">${formatIQD(l.unitPrice)}</td>
          <td style="text-align:end">${formatIQD(l.qty * l.unitPrice)}</td>
        </tr>`
      )
      .join('');
    const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<title>فاتورة ${r.id}</title>
<style>
  body { font-family: 'Cairo', sans-serif; padding: 16px; color: #1b2432; }
  h1 { text-align: center; margin: 0 0 4px; font-size: 18px; }
  .meta { font-size: 12px; color: #5b6b85; text-align: center; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { padding: 4px 6px; border-bottom: 1px dashed #aaa; }
  th { background: #f5f7fa; }
  .totals { margin-top: 12px; font-size: 14px; }
  .totals div { display: flex; justify-content: space-between; padding: 2px 0; }
  .totals .grand { font-weight: 800; font-size: 16px; border-top: 1px solid #1b2432; padding-top: 6px; }
  @media print { .no-print { display: none; } }
</style>
</head>
<body>
  <h1>صيدلية أسترا</h1>
  <div class="meta">فاتورة ${r.id} • ${new Date(r.timestamp).toLocaleString('ar-EG')}</div>
  <div style="font-size:12px;margin-bottom:8px">المريض: <b>${r.patient}</b></div>
  <table>
    <thead><tr><th>الصنف</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead>
    <tbody>${itemsHtml}</tbody>
  </table>
  <div class="totals">
    <div><span>عدد الأصناف</span><span>${r.lines.length}</span></div>
    <div><span>إجمالي الوحدات</span><span>${r.lines.reduce((s, l) => s + l.qty, 0)}</span></div>
    <div class="grand"><span>الإجمالي</span><span>${formatIQD(r.total)}</span></div>
  </div>
  <p style="text-align:center;margin-top:18px;font-size:12px;color:#5b6b85">
    شكراً لزيارتكم — صحة أهلنا أمانة في أعناقنا
  </p>
  <div class="no-print" style="text-align:center;margin-top:12px">
    <button onclick="window.print()">طباعة</button>
  </div>
</body>
</html>`;
    w.document.write(html);
    w.document.close();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Cart + scanner */}
      <div className="lg:col-span-2 space-y-4">
        {/* Barcode scanner */}
        <GlassCard className="p-4" strong>
          <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Barcode
                size={18}
                className="absolute top-1/2 -translate-y-1/2 start-3 text-[var(--aurora-violet)] pointer-events-none"
              />
              <input
                ref={scanInputRef}
                name="barcode"
                type="text"
                autoComplete="off"
                className="input ps-11 font-mono"
                placeholder="امسح الباركود أو اكتب الرقم ثم Enter…"
                style={{
                  background: scanFlash ? 'rgba(167, 139, 250, 0.2)' : undefined,
                  transition: 'background 200ms ease',
                }}
                aria-label="ماسح الباركود"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              <ScanLine size={16} />
              مسح
            </button>
          </form>
          <p className="text-[11px] text-[var(--text-secondary)] mt-2">
            ضع المؤشر على حقل الباركود، ثم امسح بالجهاز. يتم التركيز تلقائياً بعد كل عملية.
          </p>
        </GlassCard>

        {/* Cart */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <ShoppingCart size={20} />
              سلة المشتريات
            </h2>
            <button
              type="button"
              onClick={() => clearCart()}
              className="btn btn-ghost"
              disabled={state.cart.length === 0}
            >
              إفراغ
            </button>
          </div>

          {state.cart.length === 0 ? (
            <div className="text-center py-10 text-[var(--text-secondary)]">
              <ShoppingCart size={40} className="mx-auto mb-3 opacity-50" />
              <p>السلة فارغة. امسح باركود صنف لإضافته.</p>
            </div>
          ) : (
            <div className="glass-table-wrap">
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>الصنف</th>
                    <th>الكمية</th>
                    <th>السعر</th>
                    <th>الإجمالي</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l) => {
                    const isRx = prescriptionRequired[l.med.id];
                    return (
                      <tr key={l.cartId}>
                        <td>
                          <div className="font-semibold">{l.med.tradeName}</div>
                          <div className="text-xs text-[var(--text-secondary)]">
                            {l.med.condition} • {l.med.form} • {l.med.dose} • رف {l.med.shelf}
                            {isRx && (
                              <span className="chip chip-coral ms-2 !py-0">
                                Rx
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                updateCartQty(l.cartId, l.qty - 1)
                              }
                              className="btn btn-ghost !p-1"
                              aria-label="إنقاص"
                            >
                              <Minus size={14} />
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={l.qty}
                              onChange={(e) =>
                                updateCartQty(
                                  l.cartId,
                                  Math.max(1, Number(e.target.value) || 1)
                                )
                              }
                              className="input !py-1 !px-2 w-16 text-center"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                updateCartQty(l.cartId, l.qty + 1)
                              }
                              className="btn btn-ghost !p-1"
                              aria-label="زيادة"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </td>
                        <td>{formatIQD(l.unitPrice)}</td>
                        <td className="font-bold">
                          {formatIQD(l.lineTotal)}
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => removeFromCart(l.cartId)}
                            className="btn btn-ghost !p-1 text-red-500"
                            aria-label="حذف"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {state.cart.length > 0 && (
            <div className="mt-4 flex items-end justify-end">
              <div className="glass glass-sm p-4 min-w-[260px]">
                <div className="flex items-center justify-between mb-1 text-sm">
                  <span className="text-[var(--text-secondary)]">
                    عدد الأصناف
                  </span>
                  <span>{lines.length}</span>
                </div>
                <div className="flex items-center justify-between mb-1 text-sm">
                  <span className="text-[var(--text-secondary)]">
                    إجمالي الوحدات
                  </span>
                  <span>
                    {lines.reduce((s, l) => s + l.qty, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-lg font-extrabold mt-2 pt-2 border-t border-[var(--glass-border)]">
                  <span>الإجمالي</span>
                  <span>{formatIQD(total)}</span>
                </div>
              </div>
            </div>
          )}
        </GlassCard>

        {lastReceipt && (
          <GlassCard className="p-5" strong>
            <div className="flex items-center gap-2 mb-2 text-emerald-600 font-bold">
              <CheckCircle2 size={18} />
              تمت العملية بنجاح
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              رقم الفاتورة: <b>{lastReceipt.id}</b> • المريض:{' '}
              <b>{lastReceipt.patient}</b> • الإجمالي:{' '}
              <b>{formatIQD(lastReceipt.total)}</b>
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="btn"
                onClick={() => printInvoice(lastReceipt)}
              >
                <Printer size={16} />
                طباعة الفاتورة
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setLastReceipt(null)}
              >
                إغلاق
              </button>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Side panel */}
      <div className="space-y-4">
        <GlassCard className="p-5">
          <h3 className="text-lg font-extrabold mb-3 flex items-center gap-2">
            <User size={18} />
            بيانات المريض
          </h3>
          <input
            type="text"
            className="input"
            placeholder="اسم المريض (مطلوب لأدوية Rx)"
            value={patient}
            onChange={(e) => setPatient(e.target.value)}
          />
          {needsPatient && (
            <p className="mt-2 text-xs flex items-center gap-1 text-amber-700">
              <AlertCircle size={12} />
              السلة تحتوي على أدوية تتطلب وصفة
            </p>
          )}
        </GlassCard>

        <GlassCard className="p-5" strong>
          <h3 className="text-lg font-extrabold mb-3">إتمام البيع</h3>
          {error && (
            <p className="text-sm text-red-500 mb-2">{error}</p>
          )}
          <button
            type="button"
            className="btn btn-primary w-full"
            onClick={handleCompleteSale}
            disabled={state.cart.length === 0}
          >
            <CheckCircle2 size={16} />
            إتمام البيع ({formatIQD(total)})
          </button>
          {lastReceipt && (
            <button
              type="button"
              className="btn w-full mt-2"
              onClick={() => printInvoice(lastReceipt)}
            >
              <Printer size={16} />
              طباعة الفاتورة الأخيرة
            </button>
          )}
          <p className="mt-3 text-xs text-[var(--text-secondary)]">
            يتم خصم المخزون وتسجيل الفاتورة في الأرشيف تلقائياً.
          </p>
        </GlassCard>
      </div>

      {pendingBarcode && (
        <BarcodeModal
          barcode={pendingBarcode}
          onClose={() => setPendingBarcode(null)}
        />
      )}
    </div>
  );
}
