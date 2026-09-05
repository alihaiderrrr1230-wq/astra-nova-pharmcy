import { useEffect, useState, useCallback, useRef } from 'react';
import {
  STORAGE_KEY,
  DEFAULT_PHRASES,
  DEFAULT_DISTRIBUTORS,
  DEFAULT_EMPLOYEES,
  DEFAULT_MEDICINES,
  DEFAULT_RECEIPTS,
  DEFAULT_EXPENSES,
  DEFAULT_DEBTS,
  DEFAULT_SALES_LOG,
  DEFAULT_SETTINGS,
} from '../data/mockData.js';

// ---------------------------------------------------------------------
// localStorage-backed Astra store. The single key holds the entire app
// state as JSON. Components never touch localStorage directly.
// ---------------------------------------------------------------------

// Separate localStorage key for the editable NPS (Needs Procurement
// Sheet) state, so the rest of the store schema can evolve without
// disturbing the editable qty / ordered flags.
const NPS_STORAGE_KEY = 'astra-pharmacy-nps-v1';

function loadNps() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(NPS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

function persistNps(nps) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(NPS_STORAGE_KEY, JSON.stringify(nps));
  } catch {
    /* ignore */
  }
}

function loadInitial() {
  if (typeof window === 'undefined') return buildDefault();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = buildDefault();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    return { ...buildDefault(), ...parsed };
  } catch (e) {
    console.error('Astra: failed to load state, reseeding.', e);
    const seed = buildDefault();
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    } catch (_) {
      /* ignore */
    }
    return seed;
  }
}

function buildDefault() {
  return {
    settings: { ...DEFAULT_SETTINGS },
    phrases: [...DEFAULT_PHRASES],
    distributors: [...DEFAULT_DISTRIBUTORS],
    employees: [...DEFAULT_EMPLOYEES],
    medicines: [...DEFAULT_MEDICINES],
    receipts: [...DEFAULT_RECEIPTS],
    expenses: [...DEFAULT_EXPENSES],
    debts: [...DEFAULT_DEBTS],
    salesLog: [...DEFAULT_SALES_LOG],
    cart: [],
    highlighterShelf: null, // shelf code currently highlighted on the loop screen
  };
}

function persist(state) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Astra: failed to persist state.', e);
  }
}

function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

// ---------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------
export function useAstraStore() {
  const [state, setState] = useState(loadInitial);
  // NPS state lives in its own localStorage key (not the main store
  // blob) so the rest of the schema can change without losing the
  // editable quantities and "ordered" flags.
  const [nps, setNps] = useState(loadNps);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Persist on every change.
  useEffect(() => {
    persist(state);
  }, [state]);

  useEffect(() => {
    persistNps(nps);
  }, [nps]);

  // Apply theme + language to <html> whenever they change.
  useEffect(() => {
    const html = document.documentElement;
    if (state.settings.theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    html.lang = state.settings.language;
    html.dir = state.settings.language === 'ar' ? 'rtl' : 'ltr';

    // Reduced motion handling
    const mql = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    const reduced = state.settings.reducedMotion || (mql ? mql.matches : false);
    if (reduced) html.classList.add('reduced-motion');
    else html.classList.remove('reduced-motion');
  }, [state.settings.theme, state.settings.language, state.settings.reducedMotion]);

  // -----------------------------------------------------------------
  // Cart actions
  // -----------------------------------------------------------------
  const addToCart = useCallback((medicineId, qty = 1) => {
    setState((s) => {
      const med = s.medicines.find((m) => m.id === medicineId);
      if (!med || med.qty <= 0) return s;
      const cart = [...s.cart];
      const existing = cart.find((c) => c.medicineId === medicineId);
      if (existing) {
        const newQty = Math.min(existing.qty + qty, med.qty);
        existing.qty = newQty;
      } else {
        cart.push({
          id: makeId('cart'),
          medicineId,
          qty: Math.min(qty, med.qty),
          unitPrice: med.sellPrice,
        });
      }
      return { ...s, cart: cart.filter((c) => c.qty > 0) };
    });
  }, []);

  const updateCartQty = useCallback((cartId, qty) => {
    setState((s) => ({
      ...s,
      cart: s.cart
        .map((c) => {
          if (c.id !== cartId) return c;
          const med = s.medicines.find((m) => m.id === c.medicineId);
          if (!med) return c;
          return { ...c, qty: Math.max(1, Math.min(qty, med.qty)) };
        })
        .filter((c) => c.qty > 0),
    }));
  }, []);

  const removeFromCart = useCallback((cartId) => {
    setState((s) => ({ ...s, cart: s.cart.filter((c) => c.id !== cartId) }));
  }, []);

  const clearCart = useCallback(() => {
    setState((s) => ({ ...s, cart: [] }));
  }, []);

  // -----------------------------------------------------------------
  // Checkout
  // -----------------------------------------------------------------
  const checkout = useCallback(({ patient, prescriptionMap }) => {
    const s = stateRef.current;
    if (s.cart.length === 0) return null;
    const timestamp = new Date().toISOString();
    const id = makeId('rcp');

    // Build receipt and deduct stock
    const newMedicines = s.medicines.map((m) => ({ ...m }));
    const lines = s.cart.map((c) => {
      const med = newMedicines.find((m) => m.id === c.medicineId);
      if (med) {
        med.qty = Math.max(0, med.qty - c.qty);
      }
      return {
        medicineId: c.medicineId,
        name: med?.tradeName ?? '—',
        qty: c.qty,
        unitPrice: c.unitPrice,
      };
    });

    const total = Number(
      lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0).toFixed(2)
    );

    const receipt = {
      id,
      timestamp,
      patient: patient?.trim() || 'عميل نقدي',
      lines,
      total,
      prescriptionFor: Object.keys(prescriptionMap || {}).filter(
        (k) => prescriptionMap[k]
      ),
    };

    // Build sales log entries
    const salesLog = [
      ...s.salesLog,
      ...lines.map((l, i) => {
        const med = newMedicines.find((m) => m.id === l.medicineId);
        return {
          id: `${id}-${i}`,
          receiptId: id,
          medicineId: l.medicineId,
          qty: l.qty,
          unitPrice: l.unitPrice,
          unitCost: med?.buyPrice ?? 0,
          timestamp,
        };
      }),
    ];

    setState({
      ...s,
      medicines: newMedicines,
      receipts: [receipt, ...s.receipts],
      salesLog,
      cart: [],
    });

    return receipt;
  }, []);

  // -----------------------------------------------------------------
  // Medicine CRUD (Store Management)
  // -----------------------------------------------------------------
  const addMedicine = useCallback((data) => {
    setState((s) => {
      const id = makeId('med');
      const newMed = { id, ...data };
      return { ...s, medicines: [newMed, ...s.medicines] };
    });
  }, []);

  const updateMedicine = useCallback((id, patch) => {
    setState((s) => ({
      ...s,
      medicines: s.medicines.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
  }, []);

  const deleteMedicine = useCallback((id) => {
    setState((s) => ({ ...s, medicines: s.medicines.filter((m) => m.id !== id) }));
  }, []);

  // -----------------------------------------------------------------
  // Settings
  // -----------------------------------------------------------------
  const setSettings = useCallback((patch) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  // -----------------------------------------------------------------
  // Phrases
  // -----------------------------------------------------------------
  const addPhrase = useCallback((text) => {
    setState((s) => ({ ...s, phrases: [...s.phrases, text] }));
  }, []);

  const updatePhrase = useCallback((index, text) => {
    setState((s) => {
      const phrases = [...s.phrases];
      phrases[index] = text;
      return { ...s, phrases };
    });
  }, []);

  const removePhrase = useCallback((index) => {
    setState((s) => ({
      ...s,
      phrases: s.phrases.filter((_, i) => i !== index),
    }));
  }, []);

  // -----------------------------------------------------------------
  // PIN
  // -----------------------------------------------------------------
  const setPin = useCallback((newPin) => {
    setState((s) => ({ ...s, settings: { ...s.settings, pin: newPin } }));
  }, []);

  // -----------------------------------------------------------------
  // Employees
  // -----------------------------------------------------------------
  const addEmployee = useCallback((emp) => {
    setState((s) => ({ ...s, employees: [...s.employees, { id: makeId('emp'), ...emp }] }));
  }, []);

  const updateEmployee = useCallback((id, patch) => {
    setState((s) => ({
      ...s,
      employees: s.employees.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  }, []);

  const removeEmployee = useCallback((id) => {
    setState((s) => ({ ...s, employees: s.employees.filter((e) => e.id !== id) }));
  }, []);

  // -----------------------------------------------------------------
  // Distributors
  // -----------------------------------------------------------------
  const addDistributor = useCallback((d) => {
    setState((s) => ({ ...s, distributors: [...s.distributors, { id: makeId('dst'), ...d }] }));
  }, []);

  const removeDistributor = useCallback((id) => {
    setState((s) => ({ ...s, distributors: s.distributors.filter((d) => d.id !== id) }));
  }, []);

  // -----------------------------------------------------------------
  // Expenses & Debts
  // -----------------------------------------------------------------
  const addExpense = useCallback((e) => {
    setState((s) => ({ ...s, expenses: [{ id: makeId('exp'), ...e }, ...s.expenses] }));
  }, []);

  const removeExpense = useCallback((id) => {
    setState((s) => ({ ...s, expenses: s.expenses.filter((e) => e.id !== id) }));
  }, []);

  const addDebt = useCallback((d) => {
    setState((s) => ({ ...s, debts: [{ id: makeId('dbt'), ...d }, ...s.debts] }));
  }, []);

  const removeDebt = useCallback((id) => {
    setState((s) => ({ ...s, debts: s.debts.filter((d) => d.id !== id) }));
  }, []);

  // -----------------------------------------------------------------
  // UI helpers
  // -----------------------------------------------------------------
  const setHighlighterShelf = useCallback((shelf) => {
    setState((s) => ({ ...s, highlighterShelf: shelf }));
  }, []);

  // -----------------------------------------------------------------
  // NPS (editable Needs Procurement Sheet) actions.
  // The NPS state is an object keyed by medicineId:
  //   { [medicineId]: { qty: number, ordered: boolean, orderedAt?: ISO } }
  // -----------------------------------------------------------------
  const setNpsQty = useCallback((medicineId, qty) => {
    setNps((prev) => {
      const next = { ...prev };
      const cur = next[medicineId] || {};
      next[medicineId] = { ...cur, qty: Math.max(0, Number(qty) || 0) };
      return next;
    });
  }, []);

  const markNpsOrdered = useCallback((medicineId, ordered = true) => {
    setNps((prev) => {
      const next = { ...prev };
      const cur = next[medicineId] || { qty: 0 };
      next[medicineId] = {
        ...cur,
        ordered,
        orderedAt: ordered ? new Date().toISOString() : undefined,
      };
      return next;
    });
  }, []);

  const resetNps = useCallback(() => {
    setNps({});
  }, []);

  // -----------------------------------------------------------------
  // Reset / seed helpers
  // -----------------------------------------------------------------
  const resetAllData = useCallback(() => {
    const fresh = buildDefault();
    setState(fresh);
    setNps({});
  }, []);

  return {
    state,
    nps,
    // raw setters (use sparingly)
    setState,
    // cart
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    checkout,
    // medicines
    addMedicine,
    updateMedicine,
    deleteMedicine,
    // settings
    setSettings,
    // phrases
    addPhrase,
    updatePhrase,
    removePhrase,
    // PIN
    setPin,
    // employees
    addEmployee,
    updateEmployee,
    removeEmployee,
    // distributors
    addDistributor,
    removeDistributor,
    // expenses / debts
    addExpense,
    removeExpense,
    addDebt,
    removeDebt,
    // NPS
    setNpsQty,
    markNpsOrdered,
    resetNps,
    // ui
    setHighlighterShelf,
    // reset
    resetAllData,
  };
}
