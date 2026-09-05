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
  Grid3x3,
  MessageSquare,
  LogIn,
} from 'lucide-react';
import GlassCard from '../components/GlassCard.jsx';
import { useAstraStore } from '../store/useAstraStore.js';

// ---------------------------------------------------------------------
// Settings — theme toggle, reduced motion, shelf-map dimensions,
// phrase manager, exit admin, and factory reset. The PIN change flow
// itself was moved to the Admin page (tab 5) per the redesign notes.
// ---------------------------------------------------------------------
export default function Settings({ isAdminAuth, onExitAdmin, onRequireUnlock }) {
  const { state, setSettings, addPhrase, updatePhrase, removePhrase, resetAllData } =
    useAstraStore();

  const { theme, shelfColumns, shelfRows } = state.settings;
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

        {/* Shelf map dimensions */}
        <GlassCard className="p-5" strong>
          <h2 className="text-lg font-extrabold mb-3 flex items-center gap-2">
            <Grid3x3 size={18} />
            أبعاد خريطة الأرفف
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-sm text-[var(--text-secondary)] mb-1">
                عدد الأعمدة
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setSettings({ shelfColumns: Math.max(2, shelfColumns - 1) })
                  }
                  className="btn"
                >
                  −
                </button>
                <span className="font-extrabold text-lg w-10 text-center">
                  {shelfColumns}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setSettings({ shelfColumns: Math.min(10, shelfColumns + 1) })
                  }
                  className="btn"
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <div className="text-sm text-[var(--text-secondary)] mb-1">
                عدد الصفوف
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setSettings({ shelfRows: Math.max(2, shelfRows - 1) })
                  }
                  className="btn"
                >
                  −
                </button>
                <span className="font-extrabold text-lg w-10 text-center">
                  {shelfRows}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setSettings({ shelfRows: Math.min(10, shelfRows + 1) })
                  }
                  className="btn"
                >
                  +
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            تنعكس التغييرات فوراً على خريطة الأرفف.
          </p>
        </GlassCard>
      </div>

      {/* Phrase manager */}
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
