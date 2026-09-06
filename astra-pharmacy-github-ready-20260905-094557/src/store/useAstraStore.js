import {
  useEffect,
  useState,
  useCallback,
  useRef,
  createContext,
  useContext,
  createElement,
} from 'react';
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
  DEFAULT_SHELF_COLUMNS,
  SHELF_COLOR_PALETTE,
} from '../data/mockData.js';
import {
  isFileSystemAccessSupported,
  getSavedFolderHandle,
  pickFolder,
  forgetFolder,
  readDataFile,
  writeDataFile,
} from '../utils/fsStore.js';

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
    const base = buildDefault();
    return {
      ...base,
      ...parsed,
      // Deep-merge settings so newly introduced default fields (e.g.
      // hasPinSet, clinicName, exchangeRate) reach users upgrading from
      // an older saved state, instead of being wiped by a full overwrite.
      settings: { ...base.settings, ...(parsed.settings || {}) },
      shelfColumns:
        Array.isArray(parsed.shelfColumns) && parsed.shelfColumns.length > 0
          ? parsed.shelfColumns
          : base.shelfColumns,
      customNeeds: Array.isArray(parsed.customNeeds) ? parsed.customNeeds : [],
    };
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
    // Fully customizable shelf-map columns: label, color, row count and
    // display order are all editable from the Shelf Map page itself.
    shelfColumns: DEFAULT_SHELF_COLUMNS.map((c) => ({ ...c })),
    customNeeds: [], // free-form "needs list" items, independent of low-stock auto entries
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
function useAstraStoreInternal() {
  const [state, setState] = useState(loadInitial);
  // NPS state lives in its own localStorage key (not the main store
  // blob) so the rest of the schema can change without losing the
  // editable quantities and "ordered" flags.
  const [nps, setNps] = useState(loadNps);
  const stateRef = useRef(state);

  // ---- Flash-drive data store (File System Access API) ----
  // 'unsupported' | 'disconnected' | 'connecting' | 'connected'
  const [flashStatus, setFlashStatus] = useState(
    isFileSystemAccessSupported() ? 'disconnected' : 'unsupported'
  );
  const [flashFolderName, setFlashFolderName] = useState('');
  const flashHandleRef = useRef(null);
  const flashHydrated = useRef(false); // avoid writing back the file we just read from it

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // On mount: silently try to reconnect to a previously-granted flash
  // folder (no prompt — only succeeds if the browser still remembers
  // the permission grant). If found, its data file becomes the source
  // of truth for this session.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const handle = await getSavedFolderHandle();
      if (!handle || cancelled) return;
      flashHandleRef.current = handle;
      const data = await readDataFile(handle);
      if (cancelled) return;
      if (data) {
        flashHydrated.current = true;
        setState((s) => ({ ...s, ...data }));
      }
      setFlashFolderName(handle.name || 'الفلاش');
      setFlashStatus('connected');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist on every change — always to localStorage (safe fallback),
  // and additionally to the flash file when one is connected.
  useEffect(() => {
    persist(state);
    if (flashHandleRef.current) {
      if (flashHydrated.current) {
        // Skip the one write that would just echo back the data we
        // literally just read from this same file on connect.
        flashHydrated.current = false;
      } else {
        writeDataFile(flashHandleRef.current, state).catch((e) => {
          console.error('Astra: failed to write to flash drive.', e);
        });
      }
    }
  }, [state]);

  useEffect(() => {
    persistNps(nps);
  }, [nps]);

  // User-initiated: open the OS folder picker, then either adopt the
  // data already on the flash drive (if any) or seed it with the
  // current in-app state (first-time setup on a blank drive).
  const connectFlashDrive = useCallback(async () => {
    setFlashStatus('connecting');
    try {
      const handle = await pickFolder();
      flashHandleRef.current = handle;
      const existing = await readDataFile(handle);
      if (existing) {
        setState((s) => ({ ...s, ...existing }));
      } else {
        await writeDataFile(handle, stateRef.current);
      }
      setFlashFolderName(handle.name || 'الفلاش');
      setFlashStatus('connected');
      return { ok: true };
    } catch (e) {
      setFlashStatus(isFileSystemAccessSupported() ? 'disconnected' : 'unsupported');
      return { ok: false, error: e?.message || 'تعذّر الاتصال بالفلاش.' };
    }
  }, []);

  const disconnectFlashDrive = useCallback(async () => {
    await forgetFolder();
    flashHandleRef.current = null;
    setFlashFolderName('');
    setFlashStatus(isFileSystemAccessSupported() ? 'disconnected' : 'unsupported');
  }, []);

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
    setState((s) => ({
      ...s,
      settings: { ...s.settings, pin: newPin, hasPinSet: true },
    }));
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

  // ---- Employee documents (مستمسكات) — an unbounded list of {label,value}
  // pairs per employee (national ID, address, or anything else). ----
  const addEmployeeDocument = useCallback((employeeId, label = '', value = '') => {
    setState((s) => ({
      ...s,
      employees: s.employees.map((e) =>
        e.id === employeeId
          ? {
              ...e,
              documents: [
                ...(e.documents || []),
                { id: makeId('doc'), label, value },
              ],
            }
          : e
      ),
    }));
  }, []);

  const updateEmployeeDocument = useCallback((employeeId, docId, patch) => {
    setState((s) => ({
      ...s,
      employees: s.employees.map((e) =>
        e.id === employeeId
          ? {
              ...e,
              documents: (e.documents || []).map((d) =>
                d.id === docId ? { ...d, ...patch } : d
              ),
            }
          : e
      ),
    }));
  }, []);

  const removeEmployeeDocument = useCallback((employeeId, docId) => {
    setState((s) => ({
      ...s,
      employees: s.employees.map((e) =>
        e.id === employeeId
          ? { ...e, documents: (e.documents || []).filter((d) => d.id !== docId) }
          : e
      ),
    }));
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
  // Shelf map columns — fully customizable (label, color, row count,
  // display order). Column `id` stays stable so existing medicine
  // `shelf` codes (e.g. "A-1-1") keep resolving correctly even after
  // relabeling; only the *display* label/color/order change.
  // -----------------------------------------------------------------
  const updateShelfColumn = useCallback((id, patch) => {
    setState((s) => ({
      ...s,
      shelfColumns: s.shelfColumns.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  const moveShelfColumn = useCallback((id, direction) => {
    setState((s) => {
      const cols = [...s.shelfColumns].sort((a, b) => a.order - b.order);
      const idx = cols.findIndex((c) => c.id === id);
      const swapWith = direction === 'up' ? idx - 1 : idx + 1;
      if (idx === -1 || swapWith < 0 || swapWith >= cols.length) return s;
      [cols[idx].order, cols[swapWith].order] = [cols[swapWith].order, cols[idx].order];
      return { ...s, shelfColumns: cols };
    });
  }, []);

  const addShelfColumn = useCallback(() => {
    setState((s) => {
      // Next unused letter (A, B, C… Z) based on existing column ids.
      const usedLetters = new Set(s.shelfColumns.map((c) => c.id.replace('col-', '')));
      let letter = 'A';
      for (let i = 0; i < 26; i++) {
        const candidate = String.fromCharCode(65 + i);
        if (!usedLetters.has(candidate)) {
          letter = candidate;
          break;
        }
      }
      const maxOrder = s.shelfColumns.reduce((m, c) => Math.max(m, c.order), -1);
      const color =
        SHELF_COLOR_PALETTE[s.shelfColumns.length % SHELF_COLOR_PALETTE.length];
      return {
        ...s,
        shelfColumns: [
          ...s.shelfColumns,
          { id: `col-${letter}`, label: `عمود ${letter}`, color, rows: 5, order: maxOrder + 1 },
        ],
      };
    });
  }, []);

  const removeShelfColumn = useCallback((id) => {
    setState((s) => ({
      ...s,
      shelfColumns: s.shelfColumns.filter((c) => c.id !== id),
    }));
  }, []);

  // -----------------------------------------------------------------
  // Custom needs list — free-form items (not tied to low-stock
  // medicines), so the "needs" list can hold anything the pharmacy
  // wants to track (supplies, special orders, etc.).
  // -----------------------------------------------------------------
  const addCustomNeed = useCallback((item) => {
    setState((s) => ({
      ...s,
      customNeeds: [
        { id: makeId('need'), title: '', qty: 1, note: '', done: false, ...item },
        ...s.customNeeds,
      ],
    }));
  }, []);

  const updateCustomNeed = useCallback((id, patch) => {
    setState((s) => ({
      ...s,
      customNeeds: s.customNeeds.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    }));
  }, []);

  const removeCustomNeed = useCallback((id) => {
    setState((s) => ({ ...s, customNeeds: s.customNeeds.filter((n) => n.id !== id) }));
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
    addEmployeeDocument,
    updateEmployeeDocument,
    removeEmployeeDocument,
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
    // custom needs list
    addCustomNeed,
    updateCustomNeed,
    removeCustomNeed,
    // shelf map columns
    updateShelfColumn,
    moveShelfColumn,
    addShelfColumn,
    removeShelfColumn,
    // flash drive data store
    flashStatus,
    flashFolderName,
    connectFlashDrive,
    disconnectFlashDrive,
    // ui
    setHighlighterShelf,
    // reset
    resetAllData,
  };
}

// ---------------------------------------------------------------------
// Shared Context — this is the fix for a real cross-page consistency
// bug: previously every component called the state logic directly as a
// bare hook, so each one got its OWN independent copy of the state
// (only ever reconciled by re-reading localStorage on remount). Now a
// single <AstraStoreProvider> (mounted once in App.jsx) computes the
// state ONE time, and every component reads the *same* live object via
// context — so a change made on one page (or in an always-mounted
// component like TopNav) is instantly visible everywhere, with no
// refresh or remount required.
// ---------------------------------------------------------------------
const AstraStoreContext = createContext(null);

export function AstraStoreProvider({ children }) {
  const value = useAstraStoreInternal();
  return createElement(AstraStoreContext.Provider, { value }, children);
}

export function useAstraStore() {
  const ctx = useContext(AstraStoreContext);
  if (!ctx) {
    throw new Error('useAstraStore() must be used inside <AstraStoreProvider>.');
  }
  return ctx;
}

