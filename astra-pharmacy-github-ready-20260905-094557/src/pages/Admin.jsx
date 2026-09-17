import React, { useState } from 'react';
import { Database, Wallet, TrendingDown, KeyRound, Pill, ShieldCheck } from 'lucide-react';
import GlassCard from '../components/GlassCard.jsx';
import PinPad from '../components/PinPad.jsx';
import StoreManagement from './StoreManagement.jsx';
import MasterData from './MasterData.jsx';
import Finance from './Finance.jsx';
import { useAstraStore } from '../store/useAstraStore.js';

// ---------------------------------------------------------------------
// Admin — the single, unified admin page. After unlocking, the user
// lands here and can switch between 4 tabs:
//   1. إدارة المتجر  (existing StoreManagement page, as-is)
//   2. البيانات الرئيسية  (existing MasterData page, as-is)
//   3. الحسابات والجرد  (existing Finance page, as-is)
//   4. تغيير الرمز  — TWO independent PINs, each changed with a real
//      "current → new → confirm" flow (exactly like a phone's PIN
//      change), both driven by the same generic <PinPad mode="change">:
//        - رمز الإدارة   (admin PIN — settingsKey "pin")
//        - رمز الدواء     (medicine/Rx PIN — settingsKey "medicinePin",
//          required to sell any medicine flagged "يتطلب وصفة طبية")
// "بيانات العمل" (low-stock + expiry alerts) moved to the Home page.
// ---------------------------------------------------------------------

const TABS = [
  { id: 'store', label: 'إدارة المتجر', icon: Database },
  { id: 'master', label: 'البيانات الرئيسية', icon: Wallet },
  { id: 'finance', label: 'الحسابات والجرد', icon: TrendingDown },
  { id: 'pin', label: 'تغيير الرمز', icon: KeyRound },
];

export default function Admin() {
  const [tab, setTab] = useState('store');
  const { setPin, setMedicinePin } = useAstraStore();

  // Which PIN's change-flow modal is currently open: null | 'admin' | 'medicine'
  const [activeChange, setActiveChange] = useState(null);
  const [justChanged, setJustChanged] = useState(null); // brief success note

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
                  tab === t.id ? 'glass-strong' : 'bg-white/15 hover:bg-white/30'
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Medicine PIN */}
          <GlassCard className="p-6" strong>
            <h2 className="text-lg font-extrabold mb-1 flex items-center gap-2">
              <Pill size={18} className="text-rose-600" />
              رمز الدواء
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              يُطلب هذا الرمز عند إضافة أي دواء "يتطلب وصفة طبية" للسلة —
              من البحث الشامل، من الكاشير، أو بقراءة الباركود.
            </p>
            <button
              type="button"
              onClick={() => {
                setJustChanged(null);
                setActiveChange('medicine');
              }}
              className="btn btn-primary"
            >
              <KeyRound size={16} />
              تغيير رمز الدواء
            </button>
            {justChanged === 'medicine' && (
              <p className="text-sm text-emerald-600 font-bold mt-3">
                ✓ تم تغيير رمز الدواء بنجاح
              </p>
            )}
          </GlassCard>

          {/* Admin PIN */}
          <GlassCard className="p-6" strong>
            <h2 className="text-lg font-extrabold mb-1 flex items-center gap-2">
              <ShieldCheck size={18} className="text-violet-600" />
              رمز الإدارة
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              يُطلب هذا الرمز للدخول لقسم الإدارة بالكامل (إدارة المتجر،
              البيانات الرئيسية، المالية).
            </p>
            <button
              type="button"
              onClick={() => {
                setJustChanged(null);
                setActiveChange('admin');
              }}
              className="btn btn-primary"
            >
              <KeyRound size={16} />
              تغيير رمز الإدارة
            </button>
            {justChanged === 'admin' && (
              <p className="text-sm text-emerald-600 font-bold mt-3">
                ✓ تم تغيير رمز الإدارة بنجاح
              </p>
            )}
          </GlassCard>
        </div>
      )}

      {activeChange === 'medicine' && (
        <PinPad
          settingsKey="medicinePin"
          hasSetKey="hasMedicinePinSet"
          onSetPin={setMedicinePin}
          mode="change"
          title="رمز الدواء الحالي"
          subtitle="أدخل رمز الدواء الحالي، ثم اختر رمزاً جديداً وأكّده."
          onSuccess={() => {
            setActiveChange(null);
            setJustChanged('medicine');
          }}
          onCancel={() => setActiveChange(null)}
        />
      )}

      {activeChange === 'admin' && (
        <PinPad
          settingsKey="pin"
          hasSetKey="hasPinSet"
          onSetPin={setPin}
          mode="change"
          title="رمز الإدارة الحالي"
          subtitle="أدخل رمز الإدارة الحالي، ثم اختر رمزاً جديداً وأكّده."
          onSuccess={() => {
            setActiveChange(null);
            setJustChanged('admin');
          }}
          onCancel={() => setActiveChange(null)}
        />
      )}
    </div>
  );
}
