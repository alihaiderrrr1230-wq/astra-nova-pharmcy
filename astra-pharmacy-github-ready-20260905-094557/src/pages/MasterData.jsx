import React, { useState } from 'react';
import {
  Users,
  Truck,
  Receipt as ReceiptIcon,
  Plus,
  Trash2,
  Save,
  X,
  Search,
  IdCard,
} from 'lucide-react';
import GlassCard from '../components/GlassCard.jsx';
import { useAstraStore } from '../store/useAstraStore.js';
import { formatIQD } from '../utils/format.js';

const EMPTY_EMP = {
  name: '',
  role: 'صيدلي',
  salary: 0,
  hireDate: '',
  phone: '',
  documents: [],
};

export default function MasterData() {
  const {
    state,
    addEmployee,
    updateEmployee,
    removeEmployee,
    removeDistributor,
    addEmployeeDocument,
    updateEmployeeDocument,
    removeEmployeeDocument,
  } = useAstraStore();
  const [tab, setTab] = useState('employees'); // employees | distributors | receipts
  const [editingEmp, setEditingEmp] = useState(null);
  const [empForm, setEmpForm] = useState(EMPTY_EMP);
  const [empFeedback, setEmpFeedback] = useState('');
  const [receiptQuery, setReceiptQuery] = useState('');
  const [docsEmpId, setDocsEmpId] = useState(null); // employee id whose documents modal is open
  const [newDocLabel, setNewDocLabel] = useState('');
  const [newDocValue, setNewDocValue] = useState('');

  function handleEmpSubmit(e) {
    e?.preventDefault?.();
    if (!empForm.name.trim()) {
      setEmpFeedback('الاسم مطلوب');
      return;
    }
    if (editingEmp) {
      updateEmployee(editingEmp, { ...empForm });
      setEmpFeedback(`تم تحديث بيانات ${empForm.name}`);
    } else {
      addEmployee({ ...empForm });
      setEmpFeedback(`تم إضافة الموظف ${empForm.name}`);
    }
    setEmpForm(EMPTY_EMP);
    setEditingEmp(null);
    setTimeout(() => setEmpFeedback(''), 2500);
  }

  function handleEditEmp(emp) {
    setEditingEmp(emp.id);
    setEmpForm({ ...emp });
  }

  function handleDeleteEmp(emp) {
    if (confirm(`حذف الموظف ${emp.name}؟`)) removeEmployee(emp.id);
  }

  const filteredReceipts = state.receipts
    .filter((r) => {
      const q = receiptQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        r.id.toLowerCase().includes(q) ||
        r.patient.toLowerCase().includes(q) ||
        r.lines.some((l) => l.name.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <h1 className="text-2xl font-extrabold">البيانات الرئيسية</h1>
        <span className="chip chip-violet">وضع الإدارة</span>
      </div>

      {/* Tabs */}
      <GlassCard className="p-2">
        <div className="flex items-center gap-1 flex-wrap">
          {[
            { id: 'employees', label: 'الموظفون', icon: Users },
            { id: 'distributors', label: 'الموزعون والمخازن', icon: Truck },
            { id: 'receipts', label: 'أرشيف الفواتير', icon: ReceiptIcon },
          ].map((t) => {
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

      {tab === 'employees' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <GlassCard className="p-5 lg:col-span-1" strong>
            <h2 className="text-lg font-extrabold mb-3 flex items-center gap-2">
              {editingEmp ? <Save size={18} /> : <Plus size={18} />}
              {editingEmp ? 'تعديل موظف' : 'إضافة موظف'}
            </h2>
            <form onSubmit={handleEmpSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-1 block">
                  الاسم
                </label>
                <input
                  className="input"
                  value={empForm.name}
                  onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-1 block">
                  الدور
                </label>
                <select
                  className="select"
                  value={empForm.role}
                  onChange={(e) => setEmpForm({ ...empForm, role: e.target.value })}
                >
                  <option>صيدلي</option>
                  <option>صيدلي مساعد</option>
                  <option>كاشير</option>
                  <option>مدير</option>
                  <option>عاملة نظافة</option>
                  <option>أخرى</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-1 block">
                  الراتب
                </label>
                <input
                  type="number"
                  className="input"
                  value={empForm.salary}
                  onChange={(e) =>
                    setEmpForm({ ...empForm, salary: Number(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-1 block">
                  تاريخ التعيين
                </label>
                <input
                  type="date"
                  className="input"
                  value={empForm.hireDate ? empForm.hireDate.slice(0, 10) : ''}
                  onChange={(e) =>
                    setEmpForm({
                      ...empForm,
                      hireDate: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : '',
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-1 block">
                  الهاتف
                </label>
                <input
                  className="input"
                  value={empForm.phone}
                  onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <button type="submit" className="btn btn-primary">
                  {editingEmp ? <Save size={16} /> : <Plus size={16} />}
                  {editingEmp ? 'حفظ' : 'إضافة'}
                </button>
                {editingEmp && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEmp(null);
                      setEmpForm(EMPTY_EMP);
                    }}
                    className="btn"
                  >
                    <X size={14} />
                    إلغاء
                  </button>
                )}
                {empFeedback && (
                  <span className="text-sm text-emerald-600 font-semibold">
                    {empFeedback}
                  </span>
                )}
              </div>
            </form>
          </GlassCard>

          <GlassCard className="p-0 lg:col-span-2">
            <div className="p-4 flex items-center justify-between">
              <h2 className="text-lg font-extrabold">قائمة الموظفين</h2>
              <span className="text-sm text-[var(--text-secondary)]">
                {state.employees.length} موظف
              </span>
            </div>
            <div className="glass-table-wrap" style={{ maxHeight: '60vh' }}>
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>الاسم</th>
                    <th>الدور</th>
                    <th>الراتب</th>
                    <th>تاريخ التعيين</th>
                    <th>الهاتف</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {state.employees.map((e) => (
                    <tr key={e.id}>
                      <td className="font-semibold">{e.name}</td>
                      <td>{e.role}</td>
                      <td>{formatIQD(e.salary)}</td>
                      <td className="text-sm">
                        {e.hireDate
                          ? new Date(e.hireDate).toLocaleDateString('ar-EG')
                          : '—'}
                      </td>
                      <td className="text-sm">{e.phone}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setDocsEmpId(e.id)}
                            className="btn btn-ghost !p-1"
                            title="المستمسكات"
                          >
                            <IdCard size={14} className="text-sky-600" />
                            {(e.documents || []).length > 0 && (
                              <span className="text-[10px] font-bold">
                                {e.documents.length}
                              </span>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditEmp(e)}
                            className="btn btn-ghost !p-1"
                            title="تعديل"
                          >
                            <Save size={14} className="text-violet-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEmp(e)}
                            className="btn btn-ghost !p-1"
                            title="حذف"
                          >
                            <Trash2 size={14} className="text-red-500" />
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
      )}

      {tab === 'distributors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.distributors.map((d) => (
            <GlassCard key={d.id} className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-extrabold">{d.name}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {d.country} • {d.currency}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`حذف الموزع ${d.name}؟`)) removeDistributor(d.id);
                  }}
                  className="btn btn-ghost !p-1"
                  title="حذف"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
              <div className="text-sm space-y-1">
                <div>
                  <span className="text-[var(--text-secondary)]">الهاتف: </span>
                  {d.contact}
                </div>
                <div>
                  <span className="text-[var(--text-secondary)]">البريد: </span>
                  {d.email}
                </div>
                <div>
                  <span className="text-[var(--text-secondary)]">المخازن: </span>
                  {d.warehouses.join(' • ')}
                </div>
              </div>
            </GlassCard>
          ))}
          <GlassCard className="p-5 flex flex-col items-center justify-center text-center" style={{ minHeight: 180 }}>
            <Plus size={28} className="text-[var(--text-secondary)] mb-2" />
            <p className="text-sm text-[var(--text-secondary)]">
              لإضافة موزع جديد، املأ بياناته في نموذج إضافة/تعديل صنف في إدارة المتجر.
              <br />
              (يتم تجميع قائمة الموزعين تلقائياً من البيانات المُدخلة.)
            </p>
          </GlassCard>
        </div>
      )}

      {tab === 'receipts' && (
        <GlassCard className="p-0">
          <div className="p-4 flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[220px]">
              <Search
                size={16}
                className="absolute top-1/2 -translate-y-1/2 start-3 text-[var(--text-secondary)]"
              />
              <input
                className="input ps-9"
                placeholder="ابحث في الأرشيف: رقم الفاتورة، اسم المريض، أو الصنف…"
                value={receiptQuery}
                onChange={(e) => setReceiptQuery(e.target.value)}
              />
            </div>
            <span className="text-sm text-[var(--text-secondary)]">
              {filteredReceipts.length} من {state.receipts.length} فاتورة
            </span>
          </div>
          <div className="glass-table-wrap" style={{ maxHeight: '70vh' }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>رقم الفاتورة</th>
                  <th>التاريخ</th>
                  <th>المريض</th>
                  <th>الأصناف</th>
                  <th>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceipts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-[var(--text-secondary)]">
                      لا توجد فواتير
                    </td>
                  </tr>
                ) : (
                  filteredReceipts.map((r) => (
                    <tr key={r.id}>
                      <td className="font-mono text-sm">{r.id}</td>
                      <td className="text-sm">
                        {new Date(r.timestamp).toLocaleString('ar-EG')}
                      </td>
                      <td>{r.patient}</td>
                      <td className="text-sm">
                        {r.lines.map((l) => `${l.name} ×${l.qty}`).join(' • ')}
                      </td>
                      <td className="font-bold">{formatIQD(r.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Employee documents modal — an unbounded, free-form list of
          {label, value} entries (national ID number, address, anything
          else the pharmacy needs to keep on file for that employee). */}
      {docsEmpId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setDocsEmpId(null)}
        >
          <div
            className="glass glass-strong p-5 w-full max-w-md max-h-[85vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const emp = state.employees.find((e) => e.id === docsEmpId);
              if (!emp) return null;
              const docs = emp.documents || [];
              return (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-extrabold text-lg flex items-center gap-2">
                      <IdCard size={18} className="text-sky-600" />
                      مستمسكات {emp.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setDocsEmpId(null)}
                      className="p-1 rounded-full hover:bg-black/5"
                      aria-label="إغلاق"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="space-y-2 mb-4">
                    {docs.length === 0 ? (
                      <p className="text-sm text-[var(--text-secondary)]">
                        لا توجد مستمسكات مسجلة بعد لهذا الموظف.
                      </p>
                    ) : (
                      docs.map((d) => (
                        <div key={d.id} className="glass glass-xs p-2 flex items-center gap-2">
                          <input
                            type="text"
                            className="input !py-1 !text-xs flex-1"
                            placeholder="اسم المستمسك (رقم البطاقة الوطنية...)"
                            value={d.label}
                            onChange={(e) =>
                              updateEmployeeDocument(emp.id, d.id, { label: e.target.value })
                            }
                          />
                          <input
                            type="text"
                            className="input !py-1 !text-xs flex-1"
                            placeholder="القيمة"
                            value={d.value}
                            onChange={(e) =>
                              updateEmployeeDocument(emp.id, d.id, { value: e.target.value })
                            }
                          />
                          <button
                            type="button"
                            onClick={() => removeEmployeeDocument(emp.id, d.id)}
                            className="btn btn-ghost !p-1 text-rose-600"
                            title="حذف"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-[var(--glass-border)]">
                    <input
                      type="text"
                      className="input !py-1.5 !text-xs flex-1"
                      placeholder="اسم مستمسك جديد"
                      value={newDocLabel}
                      onChange={(e) => setNewDocLabel(e.target.value)}
                    />
                    <input
                      type="text"
                      className="input !py-1.5 !text-xs flex-1"
                      placeholder="القيمة (اختياري)"
                      value={newDocValue}
                      onChange={(e) => setNewDocValue(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newDocLabel.trim()) return;
                        addEmployeeDocument(emp.id, newDocLabel.trim(), newDocValue.trim());
                        setNewDocLabel('');
                        setNewDocValue('');
                      }}
                      className="btn btn-primary !py-1.5"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
