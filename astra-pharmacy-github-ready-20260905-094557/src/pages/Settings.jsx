import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  LogOut,
  RotateCcw,
  MessageSquare,
  LogIn,
  Building2,
  DollarSign,
  UsbIcon,
  CheckCircle2,
  Link2Off,
} from 'lucide-react';
import GlassCard from '../components/GlassCard.jsx';
import { useAstraStore } from '../store/useAstraStore.js';

// ---------------------------------------------------------------------
// Settings — theme toggle, reduced motion, shelf-map dimensions,
// phrase manager, exit admin, and factory reset. The PIN change flow
// itself was moved to the Admin page (tab 5) per the redesign notes.
// ---------------------------------------------------------------------
export default function Settings({ isAdminAuth, onExitAdmin, onRequireUnlock }) {
  const {
    state,
    setSettings,
    addPhrase,
    updatePhrase,
    removePhrase,
    resetAllData,
    flashStatus,
    flashFolderName,
    connectFlashDrive,
    disconnectFlashDrive,
  } = useAstraStore();
  const [flashError, setFlashError] = useState('');

  const { theme, clinicName, managerName, exchangeRate } = state.settings;
  const [clinicNameDraft, setClinicNameDraft] = useState(clinicName || '');
  const [managerNameDraft, setManagerNameDraft] = useState(managerName || '');
  const [exchangeRateDraft, setExchangeRateDraft] = useState(exchangeRate || 1310);
  const [newPhrase, setNewPhrase] = useState('');
  const [editingPhraseIdx, setEditingPhraseIdx] = useState(null);
  const [editingPhraseText, setEditingPhraseText] = useState('');
  const [resetConfirm, setResetConfirm] = useState(false);

  function handleAddPhrase(e) {
    e?.preventDefault?.();
    if (!newPhrase.trim()) return;
    addPhrase(newPhrase.trim());
    setNewPhrase('');
  }

  function handleEditPhraseStart(idx, text) {
    setEditingPhraseIdx(idx);
    setEditingPhraseText(text);
  }

  function handleEditPhraseSave() {
    if (editingPhraseIdx == null) return;
    if (editingPhraseText.trim()) {
      updatePhrase(editingPhraseIdx, editingPhraseText.trim());
    }
    setEditingPhraseIdx(null);
    setEditingPhraseText('');
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <SettingsIcon size={20} />
        <h1 className="text-2xl font-extrabold">الإعدادات</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Appearance */}
        <GlassCard className="p-5" strong>
          <h2 className="text-lg font-extrabold mb-3 flex items-center gap-2">
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            المظهر
          </h2>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-[var(--text-secondary)] mb-1">
                الوضع
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSettings({ theme: 'light' })}
                  className={`btn ${
                    theme === 'light' ? 'btn-primary' : ''
                  }`}
                >
                  <Sun size={14} />
                  نهاري
                </button>
                <button
                  type="button"
                  onClick={() => setSettings({ theme: 'dark' })}
                  className={`btn ${
                    theme === 'dark' ? 'btn-primary' : ''
                  }`}
                >
                  <Moon size={14} />
                  ليلي
                </button>
              </div>
            </div>
            <label className="flex items-center gap-2 mt-2 text-sm">
              <input
                type="checkbox"
                checked={!!state.settings.reducedMotion}
                onChange={(e) =>
                  setSettings({ reducedMotion: e.target.checked })
                }
                className="w-4 h-4"
              />
              تقليل الحركة (احترام إعداد النظام)
            </label>
          </div>
        </GlassCard>

        {/* Facility identity */}
        <GlassCard className="p-5" strong>
          <h2 className="text-lg font-extrabold mb-3 flex items-center gap-2">
            <Building2 size={18} />
            هوية المنشأة
          </h2>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-[var(--text-secondary)] mb-1">
                اسم الصيدلية / العيادة
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={clinicNameDraft}
                  onChange={(e) => setClinicNameDraft(e.target.value)}
                  className="input flex-1"
                  placeholder="مثال: صيدلية النور"
                />
                <button
                  type="button"
                  onClick={() => setSettings({ clinicName: clinicNameDraft.trim() })}
                  className="btn btn-primary"
                >
                  <Save size={14} />
                </button>
              </div>
            </div>
            <div>
              <div className="text-sm text-[var(--text-secondary)] mb-1">
                اسم المدير / المسؤول
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={managerNameDraft}
                  onChange={(e) => setManagerNameDraft(e.target.value)}
                  className="input flex-1"
                  placeholder="مثال: د. علي حيدر"
                />
                <button
                  type="button"
                  onClick={() => setSettings({ managerName: managerNameDraft.trim() })}
                  className="btn btn-primary"
                >
                  <Save size={14} />
                </button>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Currency */}
        <GlassCard className="p-5" strong>
          <h2 className="text-lg font-extrabold mb-3 flex items-center gap-2">
            <DollarSign size={18} />
            العملة وسعر الصرف
          </h2>
          <div className="space-y-3">
            <p className="text-xs text-[var(--text-secondary)]">
              كل الأسعار تُدخل وتُحفظ بالدينار العراقي (د.ع)، وتُحسب مقابلها
              بالدولار الأمريكي ($) تلقائياً حسب سعر الصرف أدناه.
            </p>
            <div>
              <div className="text-sm text-[var(--text-secondary)] mb-1">
                سعر الصرف (كم دينار يساوي 1 دولار)
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  value={exchangeRateDraft}
                  onChange={(e) => setExchangeRateDraft(Number(e.target.value) || 0)}
                  className="input flex-1"
                />
                <button
                  type="button"
                  onClick={() =>
                    setSettings({ exchangeRate: Math.max(1, exchangeRateDraft) })
                  }
                  className="btn btn-primary"
                >
                  <Save size={14} />
                </button>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                السعر الحالي: 1$ = {exchangeRate?.toLocaleString('ar-IQ')} د.ع
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Flash-drive data store */}
        <GlassCard className="p-5" strong>
          <h2 className="text-lg font-extrabold mb-3 flex items-center gap-2">
            <UsbIcon size={18} />
            الفلاش كمخزن بيانات
          </h2>

          {flashStatus === 'unsupported' && (
            <p className="text-sm text-amber-600">
              هذا المتصفح لا يدعم الوصول المباشر للفلاش. استخدم Chrome أو
              Edge لتفعيل هذي الميزة.
            </p>
          )}

          {flashStatus !== 'unsupported' && (
            <>
              <p className="text-xs text-[var(--text-secondary)] mb-3">
                اربط مجلداً على الفلاش ميموري ليصير هو مخزن بيانات هذا
                الجهاز — كل التغييرات تُحفظ عليه مباشرة، بدون حاجة لأي
                سيرفر. اسحب نفس الفلاش لأي جهاز ثاني وبياناتك توصل وياها.
              </p>

              {flashStatus === 'connected' ? (
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                    <CheckCircle2 size={16} />
                    متصل بمجلد: {flashFolderName}
                  </span>
                  <button
                    type="button"
                    onClick={disconnectFlashDrive}
                    className="btn !text-xs !py-1.5"
                  >
                    <Link2Off size={14} />
                    فصل الاتصال
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={async () => {
                      setFlashError('');
                      const res = await connectFlashDrive();
                      if (!res.ok) setFlashError(res.error);
                    }}
                    disabled={flashStatus === 'connecting'}
                    className="btn btn-primary w-full flex items-center justify-center gap-2 !py-2"
                  >
                    <UsbIcon size={16} />
                    {flashStatus === 'connecting' ? 'جارٍ الاتصال…' : 'ربط مجلد على الفلاش'}
                  </button>
                  {flashError && (
                    <p className="text-xs text-rose-600">{flashError}</p>
                  )}
                </div>
              )}
            </>
          )}
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <h2 className="text-lg font-extrabold mb-3 flex items-center gap-2">
          <MessageSquare size={18} />
          إدارة عبارات شاشة اللوب
        </h2>
        <form onSubmit={handleAddPhrase} className="flex items-center gap-2 mb-4">
          <input
            className="input flex-1"
            placeholder="أضف عبارة جديدة…"
            value={newPhrase}
            onChange={(e) => setNewPhrase(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            <Plus size={16} />
            إضافة
          </button>
        </form>
        <ul className="space-y-2">
          {state.phrases.map((p, i) => (
            <li
              key={i}
              className="flex items-center gap-2 glass glass-xs p-3"
            >
              {editingPhraseIdx === i ? (
                <>
                  <input
                    className="input flex-1"
                    value={editingPhraseText}
                    onChange={(e) => setEditingPhraseText(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleEditPhraseSave}
                    className="btn btn-primary !p-2"
                    title="حفظ"
                  >
                    <Save size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingPhraseIdx(null)}
                    className="btn !p-2"
                    title="إلغاء"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <span
                    className="flex-1 truncate"
                    style={{ fontFamily: '"Aref Ruqaa", serif' }}
                  >
                    {p}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleEditPhraseStart(i, p)}
                    className="btn btn-ghost !p-2"
                    title="تعديل"
                  >
                    <Edit3 size={14} className="text-violet-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removePhrase(i)}
                    className="btn btn-ghost !p-2"
                    title="حذف"
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      </GlassCard>

      {/* Admin / reset */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="p-5" strong>
          <h2 className="text-lg font-extrabold mb-3 flex items-center gap-2">
            <LogIn size={18} />
            وضع الإدارة
          </h2>
          {isAdminAuth ? (
            <button
              type="button"
              className="btn"
              onClick={onExitAdmin}
            >
              <LogOut size={16} />
              خروج من وضع الإدارة
            </button>
          ) : (
            <button
              type="button"
              className="btn"
              onClick={() => onRequireUnlock?.('admin')}
            >
              <LogIn size={16} />
              تفعيل وضع الإدارة
            </button>
          )}
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            يتيح الوصول إلى صفحة "الإدارة" (إدارة المتجر، البيانات، الحسابات، بيانات العمل، تغيير الرمز).
          </p>
        </GlassCard>

        <GlassCard className="p-5" strong>
          <h2 className="text-lg font-extrabold mb-3 flex items-center gap-2">
            <RotateCcw size={18} />
            إعادة تعيين البيانات
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-3">
            سيعيد النظام كل البيانات إلى القيم الأولية. لا يمكن التراجع.
          </p>
          {resetConfirm ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  resetAllData();
                  setResetConfirm(false);
                }}
                className="btn btn-danger"
              >
                <Trash2 size={16} />
                تأكيد الحذف الكامل
              </button>
              <button
                type="button"
                onClick={() => setResetConfirm(false)}
                className="btn"
              >
                إلغاء
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setResetConfirm(true)}
              className="btn btn-danger"
            >
              <RotateCcw size={16} />
              إعادة ضبط المصنع
            </button>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
