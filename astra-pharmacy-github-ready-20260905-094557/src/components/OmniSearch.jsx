import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { useAstraStore } from '../store/useAstraStore.js';

// ---------------------------------------------------------------------
// OmniSearch — global search by trade name, scientific name, disease /
// condition, warehouse, or country. Live dropdown of results with an
// inline "add to cart" action. Reachable from every page because it
// lives inside the persistent top nav.
// ---------------------------------------------------------------------
export default function OmniSearch({ compact = false, wide = false }) {
  const { state, addToCart, setHighlighterShelf } = useAstraStore();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const matches = state.medicines.filter((m) => {
      return (
        m.tradeName.toLowerCase().includes(q) ||
        m.scientificName.toLowerCase().includes(q) ||
        m.condition.toLowerCase().includes(q) ||
        m.country.toLowerCase().includes(q) ||
        m.company.toLowerCase().includes(q) ||
        m.warehouse?.toLowerCase?.().includes(q) ||
        m.form.toLowerCase().includes(q) ||
        m.shelf.toLowerCase().includes(q) ||
        m.barcode?.toLowerCase().includes(q)
      );
    });
    return matches.slice(0, 12);
  }, [query, state.medicines]);

  // Close on outside click
  useEffect(() => {
    function onDoc(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function handleSelect(med) {
    setHighlighterShelf(med.shelf);
    setOpen(false);
    setQuery('');
  }

  function handleAdd(med) {
    addToCart(med.id, 1);
    setHighlighterShelf(med.shelf);
  }

  function handleKeyDown(e) {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const med = results[activeIndex];
      if (med) handleAdd(med);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  const containerStyle = wide
    ? { width: '100%' }
    : { minWidth: compact ? 180 : 260, maxWidth: 460 };

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={containerStyle}
    >
      <div className="relative">
        <Search
          size={16}
          className="absolute top-1/2 -translate-y-1/2 start-3 text-[var(--text-secondary)] pointer-events-none"
        />
        <input
          type="text"
          className="input ps-9 pe-9"
          placeholder="بحث شامل (اسم، مرض، مخزن، بلد)…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          aria-label="Omni search"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setOpen(false);
            }}
            className="absolute top-1/2 -translate-y-1/2 end-2 p-1 rounded-full hover:bg-white/30"
            aria-label="Clear"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {open && query && (
        <div
          className="absolute z-50 start-0 end-0 mt-2 glass glass-sm p-2 max-h-80 overflow-auto"
          role="listbox"
        >
          {results.length === 0 ? (
            <div className="p-3 text-sm text-[var(--text-secondary)] text-center">
              لا توجد نتائج
            </div>
          ) : (
            results.map((med, idx) => (
              <div
                key={med.id}
                className={`flex items-center gap-2 p-2 rounded-[12px] cursor-pointer ${
                  idx === activeIndex ? 'bg-white/40' : 'hover:bg-white/20'
                }`}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => handleSelect(med)}
                role="option"
                aria-selected={idx === activeIndex}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">
                    {med.tradeName}
                    {med.qty <= 0 && (
                      <span className="chip chip-coral ms-2 !py-0 !text-[10px]">
                        نفد
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] truncate">
                    {med.condition} • {med.form} • {med.dose} • رف {med.shelf}
                  </div>
                </div>
                <div className="text-xs text-[var(--text-secondary)] whitespace-nowrap">
                  {med.sellPrice.toFixed(2)}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdd(med);
                  }}
                  className="btn btn-primary !py-1 !px-2 !text-xs"
                  title={
                    med.qty <= 0 ? 'نفد من المخزون' : 'إضافة إلى السلة'
                  }
                  aria-label={`Add ${med.tradeName} to cart`}
                  disabled={med.qty <= 0}
                  style={med.qty <= 0 ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
                >
                  <Plus size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
