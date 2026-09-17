import React, { useState, useEffect, useCallback } from 'react';
import { Delete, X } from 'lucide-react';
import { useAstraStore } from '../store/useAstraStore.js';
import GlassCard from './GlassCard.jsx';

// ---------------------------------------------------------------------
// PinPad — a single, generic 4-digit PIN component reused everywhere a
// code is needed in the app: unlocking Admin, changing either PIN
// (admin or medicine) from a real "old → new → confirm" flow exactly
// like a phone's PIN change, and a one-shot "verify" prompt used to
// gate adding a prescription-only medicine to the cart.
//
// Props:
//   settingsKey  — which field in state.settings holds the PIN
//                  ('pin' for admin, 'medicinePin' for the Rx lock)
//   hasSetKey    — the matching boolean flag field
//   onSetPin     — store action to persist a new PIN for this key
//   mode:
//     'unlock' (default) — used to gate a whole page (Admin). If no
//        PIN has ever been set, first asks to create one; otherwise
//        asks for the existing PIN.
//     'change' — always asks for the CURRENT pin first (it must
//        already exist), then a new pin, then confirms it — the
//        classic phone "change PIN" flow.
//     'verify' — a single prompt for the existing PIN with no set/
//        confirm step at all. Used for one-off actions (e.g. adding a
//        prescription medicine to the cart).
//   title / subtitle — optional copy overrides for the "enter" stage,
//        so the same component reads as "رمز الإدارة" or "رمز الدواء"
//        depending on context.
// ---------------------------------------------------------------------
const PIN_LENGTH = 4;
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

export default function PinPad({
  settingsKey = 'pin',
  hasSetKey = 'hasPinSet',
  onSetPin,
  mode = 'unlock',
  title,
  subtitle,
  onSuccess,
  onCancel,
}) {
  const { state } = useAstraStore();
  const currentPin = state.settings[settingsKey];
  const hasPinSet = state.settings[hasSetKey];

  const advanceToChangeAfterEntry = mode === 'change';
  const initialStage =
    mode === 'unlock' && !hasPinSet ? 'set' : 'enter';

  const [stage, setStage] = useState(initialStage);
  // 'enter'   : type the existing PIN (to unlock, to verify, or to
  //             authorize a change before picking a new one)
  // 'set'     : type a brand new PIN
  // 'confirm' : re-type the new PIN to confirm it
  const [firstPin, setFirstPin] = useState('');
  const [entry, setEntry] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!lockedUntil) return;
    const i = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(i);
  }, [lockedUntil]);

  const isLocked = lockedUntil > now;

  const press = useCallback(
    (key) => {
      if (isLocked) return;
      if (key === 'del') {
        setEntry((e) => e.slice(0, -1));
        setError('');
        return;
      }
      if (entry.length >= PIN_LENGTH) return;
      const next = entry + key;
      setEntry(next);
      setError('');
      if (next.length === PIN_LENGTH) {
        setTimeout(() => processEntry(next), 120);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entry, isLocked, stage, firstPin]
  );

  function processEntry(value) {
    if (stage === 'enter') {
      if (value === currentPin) {
        setWrongCount(0);
        setEntry('');
        if (advanceToChangeAfterEntry) {
          setStage('set');
        } else {
          onSuccess?.();
        }
      } else {
        failAttempt();
      }
      return;
    }
    if (stage === 'set') {
      setFirstPin(value);
      setEntry('');
      setStage('confirm');
      return;
    }
    if (stage === 'confirm') {
      if (value === firstPin) {
        onSetPin?.(value);
        setStage('enter');
        setEntry('');
        setFirstPin('');
        onSuccess?.();
      } else {
        setFirstPin('');
        setEntry('');
        setStage('set');
        setError('الرمزان غير متطابقين، أعد المحاولة');
        triggerShake();
      }
    }
  }

  function failAttempt() {
    triggerShake();
    setEntry('');
    const next = wrongCount + 1;
    setWrongCount(next);
    if (next >= 3) {
      setError('تم تعطيل اللوحة مؤقتاً');
      setLockedUntil(Date.now() + 5000);
      setWrongCount(0);
    } else {
      setError(`رمز خاطئ (${3 - next} محاولات متبقية)`);
    }
  }

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 360);
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key >= '0' && e.key <= '9') press(e.key);
      else if (e.key === 'Backspace') press('del');
      else if (e.key === 'Escape') onCancel?.();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [press, onCancel]);

  const stageTitle =
    stage === 'enter'
      ? title || 'أدخل رمز PIN'
      : stage === 'set'
      ? 'اختر رمز PIN جديد (4 أرقام)'
      : 'أعد إدخال الرمز للتأكيد';

  const remaining = Math.max(0, Math.ceil((lockedUntil - now) / 1000));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="PIN pad"
    >
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      <GlassCard
        className="relative max-w-sm w-full p-6"
        strong
        style={{ zIndex: 1 }}
      >
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-ghost absolute top-3 end-3 p-2"
          aria-label="إغلاق"
        >
          <X size={16} />
        </button>

        <h2 className="text-xl font-extrabold mb-1 text-center">{stageTitle}</h2>
        <p className="text-sm text-[var(--text-secondary)] text-center mb-5">
          {subtitle || 'هذه المنطقة محمية وتتطلب رمزاً'}
        </p>

        <div
          className={`flex items-center justify-center gap-3 mb-2 ${
            shake ? 'shake' : ''
          }`}
        >
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <span
              key={i}
              className={`pin-dot ${
                i < entry.length ? (error ? 'error' : 'filled') : ''
              }`}
            />
          ))}
        </div>

        <div className="min-h-[20px] text-center text-sm mb-3" aria-live="polite">
          {error ? (
            <span className="text-red-500 font-semibold">
              {isLocked ? `${error} (${remaining} ثانية)` : error}
            </span>
          ) : (
            <span className="text-[var(--text-secondary)]">
              {stage === 'enter' ? '••••' : 'اختر 4 أرقام'}
            </span>
          )}
        </div>

        <div
          className="grid grid-cols-3 gap-2 mt-3"
          style={{ pointerEvents: isLocked ? 'none' : 'auto', opacity: isLocked ? 0.6 : 1 }}
        >
          {KEYS.map((k, i) =>
            k === '' ? (
              <div key={i} />
            ) : k === 'del' ? (
              <button
                key={i}
                type="button"
                onClick={() => press('del')}
                className="btn"
                aria-label="حذف"
                disabled={isLocked}
              >
                <Delete size={20} />
              </button>
            ) : (
              <button
                key={i}
                type="button"
                onClick={() => press(k)}
                className="btn"
                style={{ fontSize: '1.2rem', padding: '1rem 0' }}
                disabled={isLocked}
              >
                {k}
              </button>
            )
          )}
        </div>
      </GlassCard>
    </div>
  );
}
