import React, { useState } from 'react';
import { Database, Wallet, TrendingDown, KeyRound } from 'lucide-react';
import GlassCard from '../components/GlassCard.jsx';
import PinPad from '../components/PinPad.jsx';
import StoreManagement from './StoreManagement.jsx';
import MasterData from './MasterData.jsx';
import Finance from './Finance.jsx';
import { useAstraStore } from '../store/useAstraStore.js';

// ---------------------------------------------------------------------
// Admin — the single, unified admin page (replaces the three formerly
// separate locked items: store / master / finance). After unlocking,
// the user lands here and can switch between 4 tabs:
//   1. إدارة المتجر  (existing StoreManagement page, as-is)
//   2. البيانات الرئيسية  (existing MasterData page, as-is)
//   3. الحسابات والجرد  (existing Finance page, as-is)
//   4. تغيير الرمز  (verify current PIN, then set + confirm new)
// "بيانات العمل" (low-stock + expiry alerts) moved to the Home page —
// it's business-visibility info the whole team should see at a glance,
// not something that needs the admin PIN.
// ---------------------------------------------------------------------

const TABS = [
  { id: 'store', label: 'إدارة المتجر', icon: Database },
  { id: 'master', label: 'البيانات الرئيسية', icon: Wallet },
  { id: 'finance', label: 'الحسابات والجرد', icon: TrendingDown },
  { id: 'pin', label: 'تغيير الرمز', icon: KeyRound },
];

export default function Admin() {
  const [tab, setTab] = useState('store');
  const [pinStage, setPinStage] = useState(null); // null | 'verify' | 'set' | 'confirm'
  const [pinFlowPin, setPinFlowPin] = useState('');
  const [pinError, setPinError] = useState('');

  const { state, setPin } = useAstraStore();
  const { pin } = state.settings;

  function handlePinChangeSubmit(value) {
    if (pinStage === 'verify') {
      if (value === pin) {
        setPinStage('set');
        setPinError('');
      } else {
        setPinError('الرمز الحالي غير صحيح');
        setPinStage(null);
      }
      return;
    }
    if (pinStage === 'set') {
      setPinFlowPin(value);
      setPinStage('confirm');
      return;
    }
    if (pinStage === 'confirm') {
      if (value === pinFlowPin) {
        setPin(value);
        setPinStage(null);
        setPinFlowPin('');
        setPinError('');
      } else {
        setPinError('الرمزان غير متطابقين');
        setPinFlowPin('');
        setPinStage('set');
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Database size={20} />
        <h1 className="text-2xl font-extrabold">الإدارة</h1>
        <span className="chip chip-violet">وضع الإدارة</span>
      </div>

      {/* Tabs */}
      <GlassCard className="p-2">
        <div className="flex items-center gap-1 flex-wrap">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-[14px] text-sm font-semibold ${
                  tab === t.id
                    ? 'glass-strong'
                    : 'bg-white/15 hover:bg-white/30'
                }`}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {tab === 'store' && <StoreManagement />}
      {tab === 'master' && <MasterData />}
      {tab === 'finance' && <Finance />}
      {tab === 'pin' && (
        <GlassCard className="p-6" strong>
          <h2 className="text-xl font-extrabold mb-2 flex items-center gap-2">
            <KeyRound size={20} />
            تغيير رمز PIN
          </h2>
          {pinError && (
            <p className="text-sm text-red-500 mb-3">{pinError}</p>
          )}
          {pinStage === null && (
            <>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                لإدارة رمز PIN، اضغط الزر أدناه لبدء عملية التغيير. سيُطلب
                منك إدخال الرمز الحالي للتحقق، ثم الرمز الجديد مرتين.
              </p>
              <button
                type="button"
                onClick={() => setPinStage('verify')}
                className="btn btn-primary"
              >
                <KeyRound size={16} />
                ابدأ تغيير الرمز
              </button>
            </>
          )}
          {pinStage === 'verify' && (
            <p className="text-sm text-[var(--text-secondary)]">
              أدخل الرمز الحالي للتحقق.
            </p>
          )}
          {pinStage === 'set' && (
            <p className="text-sm text-[var(--text-secondary)]">
              أدخل الرمز الجديد (4 أرقام).
            </p>
          )}
          {pinStage === 'confirm' && (
            <p className="text-sm text-[var(--text-secondary)]">
              أعد إدخال الرمز الجديد للتأكيد.
            </p>
          )}
          {pinStage === null && pinError === 'تم تغيير الرمز بنجاح' && (
            <p className="text-sm text-emerald-600 font-bold mt-2">
              ✓ تم تغيير الرمز بنجاح
            </p>
          )}
        </GlassCard>
      )}

      {(pinStage === 'verify' ||
        pinStage === 'set' ||
        pinStage === 'confirm') && (
        <PinPad
          onSuccess={(value) => {
            if (pinStage === 'verify' && value === pin) {
              setPinStage('set');
              setPinError('');
            } else if (pinStage === 'verify') {
              setPinError('الرمز الحالي غير صحيح');
              setPinStage(null);
            } else if (pinStage === 'set') {
              setPinFlowPin(value);
              setPinStage('confirm');
            } else if (pinStage === 'confirm') {
              if (value === pinFlowPin) {
                setPin(value);
                setPinStage(null);
                setPinFlowPin('');
                setPinError('تم تغيير الرمز بنجاح');
              } else {
                setPinError('الرمزان غير متطابقين');
                setPinFlowPin('');
                setPinStage('set');
              }
            }
          }}
          onCancel={() => {
            setPinStage(null);
            setPinFlowPin('');
            setPinError('');
          }}
        />
      )}
    </div>
  );
}
