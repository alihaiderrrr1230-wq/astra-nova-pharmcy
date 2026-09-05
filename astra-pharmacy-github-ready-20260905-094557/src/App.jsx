import React, { useState, useEffect, useCallback } from 'react';
import AuroraBackground from './components/AuroraBackground.jsx';
import TopNav from './components/TopNav.jsx';
import PinPad from './components/PinPad.jsx';
import Home from './pages/Home.jsx';
import POS from './pages/POS.jsx';
import Inventory from './pages/Inventory.jsx';
import ShelfMap from './pages/ShelfMap.jsx';
import Admin from './pages/Admin.jsx';
import Settings from './pages/Settings.jsx';

// ---------------------------------------------------------------------
// Top-level App
// - activePage: in-memory, not persisted
// - isAdminAuth: session-only, cleared on refresh
// - When a locked page is clicked while unauthenticated, the PinPad is
//   shown first; on success the user is taken straight into the page.
// - Pages cross-fade via keying the wrapper.
// ---------------------------------------------------------------------

const PAGES = {
  home: { label: 'الرئيسية', component: Home, locked: false },
  pos: { label: 'الكاشير', component: POS, locked: false },
  inventory: { label: 'المخزن', component: Inventory, locked: false },
  'shelf-map': { label: 'خريطة الأرفف', component: ShelfMap, locked: false },
  admin: { label: 'الإدارة', component: Admin, locked: true },
  settings: { label: 'الإعدادات', component: Settings, locked: false },
};

export default function App() {
  const [activePage, setActivePage] = useState('home');
  // Admin auth now persists across page refreshes via localStorage, so
  // the user enters the PIN once and stays unlocked until they
  // explicitly log out via the "Exit Admin Mode" control. The flag is
  // namespaced under 'astra-admin-auth' so it doesn't collide with
  // anything else.
  const [isAdminAuth, setIsAdminAuth] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem('astra-admin-auth') === '1';
    } catch {
      return false;
    }
  });
  const [pendingPage, setPendingPage] = useState(null);
  const [showPin, setShowPin] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('astra-admin-auth', isAdminAuth ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [isAdminAuth]);

  // Respect prefers-reduced-motion at boot
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    document.documentElement.classList.toggle('reduced-motion', mql.matches);
    const handler = (e) =>
      document.documentElement.classList.toggle('reduced-motion', e.matches);
    mql.addEventListener?.('change', handler);
    return () => mql.removeEventListener?.('change', handler);
  }, []);

  const navigate = useCallback((page) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleRequestUnlock = useCallback((page) => {
    setPendingPage(page);
    setShowPin(true);
  }, []);

  const handlePinSuccess = useCallback(() => {
    setIsAdminAuth(true);
    setShowPin(false);
    if (pendingPage) {
      navigate(pendingPage);
      setPendingPage(null);
    }
  }, [pendingPage, navigate]);

  const handlePinCancel = useCallback(() => {
    setShowPin(false);
    setPendingPage(null);
  }, []);

  const handleExitAdmin = useCallback(() => {
    setIsAdminAuth(false);
    if (activePage === 'admin') setActivePage('home');
  }, [activePage]);

  const PageComponent = PAGES[activePage]?.component ?? Home;
  const pageLocked =
    PAGES[activePage]?.locked && !isAdminAuth && activePage !== 'admin';

  return (
    <>
      <AuroraBackground />

      <div className="min-h-screen flex flex-col">
        <TopNav
          activePage={activePage}
          onNavigate={navigate}
          onRequestUnlock={handleRequestUnlock}
          isAdminAuth={isAdminAuth}
          onExitAdmin={handleExitAdmin}
        />

        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          {pageLocked ? (
            <LockedNotice onRequestUnlock={handleRequestUnlock} />
          ) : (
            <div key={activePage} className="page-fade">
              {activePage === 'settings' ? (
                <Settings
                  isAdminAuth={isAdminAuth}
                  onExitAdmin={handleExitAdmin}
                  onRequireUnlock={handleRequestUnlock}
                />
              ) : activePage === 'admin' ? (
                <Admin />
              ) : (
                <PageComponent />
              )}
            </div>
          )}
        </main>

        <footer
          className="text-center py-4 text-xs text-[var(--text-secondary)]"
          dir="rtl"
        >
          صيدلية أسترا — جميع البيانات تُحفظ محلياً وتعمل دون اتصال
        </footer>
      </div>

      {showPin && (
        <PinPad onSuccess={handlePinSuccess} onCancel={handlePinCancel} />
      )}
    </>
  );
}

function LockedNotice({ onRequestUnlock }) {
  return (
    <div className="page-fade">
      <div className="glass p-8 md:p-12 text-center" style={{ borderRadius: 28 }}>
        <h2 className="text-2xl font-extrabold mb-2">هذه الصفحة محمية</h2>
        <p className="text-[var(--text-secondary)] mb-5">
          يلزم إدخال رمز PIN للوصول إلى هذه المنطقة
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onRequestUnlock('__resume__')}
        >
          إدخال رمز PIN
        </button>
      </div>
    </div>
  );
}
