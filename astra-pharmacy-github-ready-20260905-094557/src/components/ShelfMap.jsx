import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useAstraStore } from '../store/useAstraStore.js';

// ---------------------------------------------------------------------
// ShelfMap — visual layout of the pharmacy's "columns" (formerly called
// "أرفف / shelves"). Each column is fully customizable: its own label,
// color, and row count, in any display order — all editable from the
// customize panel on the ShelfMap page itself (not Settings).
//
// A cell is highlighted when its code matches the highlighterShelf in
// the store (set by the Omni search or the POS cart). Clicking any
// cell that holds one or more medicines opens a modal listing all of
// them (a column/row position can legitimately hold several items).
// ---------------------------------------------------------------------

function columnLetter(id) {
  return id.replace('col-', '');
}

export default function ShelfMap({ highlight }) {
  const { state } = useAstraStore();
  const highlighter = highlight ?? state.highlighterShelf;
  const [openCell, setOpenCell] = useState(null); // { col, row, meds }

  const columns = useMemo(
    () => [...state.shelfColumns].sort((a, b) => a.order - b.order),
    [state.shelfColumns]
  );

  // shelf code format: "<letter>-<row>-<n>" e.g. "A-3-2"
  function medsAt(letter, row) {
    return state.medicines.filter((m) => {
      const parts = m.shelf.split('-');
      return parts[0] === letter && Number(parts[1]) === row;
    });
  }

  function isHighlighted(letter, row) {
    if (!highlighter) return false;
    const parts = highlighter.split('-');
    return parts[0] === letter && Number(parts[1]) === row;
  }

  return (
    <div className="overflow-auto">
      <div className="flex gap-3 items-start">
        {columns.map((col) => {
          const letter = columnLetter(col.id);
          return (
            <div key={col.id} className="flex flex-col gap-2 min-w-[110px]">
              <div
                className="text-center font-extrabold text-sm rounded-lg py-1.5 px-2 text-white shadow-sm"
                style={{ backgroundColor: col.color }}
              >
                {col.label}
              </div>
              {Array.from({ length: col.rows }).map((_, r) => {
                const row = r + 1;
                const meds = medsAt(letter, row);
                const hl = isHighlighted(letter, row);
                return (
                  <button
                    type="button"
                    key={`${col.id}-${row}`}
                    onClick={() => meds.length > 0 && setOpenCell({ col, row, meds })}
                    className={`shelf-cell text-start ${hl ? 'highlight' : ''}`}
                    style={{
                      borderColor: hl ? undefined : `${col.color}55`,
                      cursor: meds.length > 0 ? 'pointer' : 'default',
                    }}
                    title={meds.map((m) => m.tradeName).join(' • ') || `${letter}-${row}`}
                    aria-label={`${col.label} صف ${row}: ${meds.length} صنف${hl ? ' (محدد)' : ''}`}
                  >
                    <div className="flex flex-col items-center gap-0.5 py-1">
                      <span className="text-[10px] text-[var(--text-secondary)]">
                        {letter}-{row}
                      </span>
                      {meds.length > 0 && (
                        <span className="text-xs font-bold truncate max-w-full">
                          {meds[0].tradeName}
                        </span>
                      )}
                      {meds.length > 1 && (
                        <span className="text-[10px] text-[var(--text-secondary)]">
                          +{meds.length - 1} أخرى
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {highlighter && (
        <p className="mt-3 text-sm text-[var(--text-secondary)] text-center">
          موقع الدواء المحدد:{' '}
          <span className="font-bold text-[var(--text-primary)]">{highlighter}</span>
        </p>
      )}

      {/* Cell detail modal — lists every medicine sharing this position */}
      {openCell && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpenCell(null)}
        >
          <div
            className="glass glass-strong p-5 w-full max-w-sm max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-lg">
                {openCell.col.label} — صف {openCell.row}
              </h3>
              <button
                type="button"
                onClick={() => setOpenCell(null)}
                className="p-1 rounded-full hover:bg-black/5"
                aria-label="إغلاق"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2">
              {openCell.meds.map((m) => (
                <div key={m.id} className="glass glass-xs p-3">
                  <div className="font-bold text-sm">{m.tradeName}</div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    {m.scientificName} • {m.condition}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1">
                    الكمية المتوفرة: {m.qty}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
