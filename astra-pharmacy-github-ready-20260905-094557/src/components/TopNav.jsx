import React from 'react';
import {
  Home,
  ShoppingCart,
  Package,
  Settings as SettingsIcon,
  Lock,
  Unlock,
  Wallet,
  Grid3x3,
  Sun,
  Moon,
  CircleDot,
} from 'lucide-react';
import Logo from './Logo.jsx';
import { useAstraStore } from '../store/useAstraStore.js';

// All nav items. The 3 previously-locked items (store / master / finance)
// are now collapsed under a single "الإدارة" item — the user is taken
// to a unified admin page (with 5 tabs) after unlocking.
const NAV = [
  { id: 'home', label: 'الرئيسية', icon: Home, locked: false },
  { id: 'pos', label: 'الكاشير', icon: ShoppingCart, locked: false },
  { id: 'inventory', label: 'المخزن', icon: Package, locked: false },
  { id: 'shelf-map', label: 'خريطة الأعمدة', icon: Grid3x3, locked: false },
  { id: 'admin', label: 'الإدارة', icon: Wallet, locked: true },
  { id: 'settings', label: 'الإعدادات', icon: SettingsIcon, locked: false },
];

export default function TopNav({
  activePage,
  onNavigate,
  onRequestUnlock,
  isAdminAuth,
  onExitAdmin,
}) {
  const { state, setSettings } = useAstraStore();
  const { theme } = state.settings;

  function handleClick(item) {
    if (item.locked && !isAdminAuth) {
      onRequestUnlock(item.id);
      return;
    }
    onNavigate(item.id);
  }

  return (
    <header
      className="sticky top-0 z-40 glass glass-sm"
      style={{ borderRadius: 0, borderTop: 'none', borderInline: 'none' }}
    >
      <div className="flex items-center gap-3 px-4 py-3 flex-wrap md:flex-nowrap">
        {/* 1) Logo + brand (right side in RTL) */}
        <button
          type="button"
          onClick={() => handleClick(NAV[0])}
          className="flex items-center gap-2 shrink-0 btn-ghost p-1 order-1"
          aria-label="Astra Pharmacy home"
        >
          <Logo size={40} />
          <div className="leading-tight text-start hidden sm:block">
            <div className="font-extrabold text-lg">ASTRA</div>
            <div className="text-[10px] text-[var(--text-secondary)] -mt-1">
              {state.settings.clinicName || 'صيدلية أسترا'}
            </div>
          </div>
        </button>

        {/* 2) Nav pills — clustered next to the logo on the right */}
        <nav
          className="nav-scroll flex items-center gap-1 order-3 md:order-2 flex-1 md:flex-none md:ms-3"
          aria-label="Primary"
        >
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            const isLocked = item.locked && !isAdminAuth;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleClick(item)}
                className={`flex items-center gap-2 px-3 py-2 rounded-[14px] text-sm font-semibold transition shrink-0 ${
                  isActive
                    ? 'glass-strong text-[var(--text-primary)]'
                    : 'bg-white/15 hover:bg-white/30 text-[var(--text-primary)]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={16} />
                <span className="hidden lg:inline">{item.label}</span>
                {item.locked && (
                  isLocked ? (
                    <Lock size={12} className="opacity-70" />
                  ) : (
                    <Unlock size={12} className="opacity-70" />
                  )
                )}
              </button>
            );
          })}
        </nav>

        {/* 3) A controlled-width gap that pushes end items to the left,
            but not so far that it eats the whole row. */}
        <div className="hidden md:block md:flex-1 md:max-w-[80px]" />

        {/* 4) End items (theme + status), clustered on the left in RTL */}
        {isAdminAuth && (
          <button
            type="button"
            onClick={onExitAdmin}
            className="chip chip-violet order-2 md:order-3"
            title="إنهاء وضع الإدارة"
          >
            <Unlock size={12} />
            <span className="hidden md:inline">وضع الإدارة</span>
            <span className="md:hidden">خروج</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setSettings({ theme: theme === 'dark' ? 'light' : 'dark' })}
          className="btn btn-ghost p-2 order-2 md:order-4"
          title={theme === 'dark' ? 'وضع نهاري' : 'وضع ليلي'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div
          className="hidden md:flex items-center gap-1 order-5 text-xs text-[var(--text-secondary)]"
          title="النظام يعمل بالكامل دون اتصال"
        >
          <CircleDot size={14} className="text-emerald-500" />
          <span>متصل</span>
        </div>
      </div>
    </header>
  );
}
