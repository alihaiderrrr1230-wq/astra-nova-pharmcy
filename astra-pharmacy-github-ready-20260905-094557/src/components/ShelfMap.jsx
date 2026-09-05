import React, { useMemo } from 'react';
import { useAstraStore } from '../store/useAstraStore.js';

// ---------------------------------------------------------------------
// ShelfMap — visual grid of shelf locations.
// Columns are lettered A, B, C…; rows are numbered (1, 2, 3…) and each
// cell is encoded "A-3-2" style (column-row-shelf).
//
// A cell is highlighted when its code matches the highlighterShelf
// in the store (set by the Omni search or the POS cart).
// ---------------------------------------------------------------------
function columnLabel(i) {
  return String.fromCharCode(65 + i); // 0 -> 'A'
}

export default function ShelfMap({ highlight }) {
  const { state } = useAstraStore();
  const { shelfColumns, shelfRows } = state.settings;
  const highlighter = highlight ?? state.highlighterShelf;

  // Build a map of shelfCode -> medicines on that shelf
  const shelfMap = useMemo(() => {
    const m = new Map();
    for (const med of state.medicines) {
      const key = med.shelf;
      if (!m.has(key)) m.set(key, []);
      m.get(key).push(med);
    }
    return m;
  }, [state.medicines]);

  // Each cell uses the format "A-3" (column-row). The "shelf" code in
  // the data is "A-3-2" — column-row-shelfNumber. We map back to the
  // 2D position by parsing column letter + row number.
  function cellAt(col, row) {
    // Show whichever medicines have any shelf code starting with `${col}-${row}-`
    const meds = state.medicines.filter((m) => {
      const parts = m.shelf.split('-');
      return parts[0] === columnLabel(col) && Number(parts[1]) === row;
    });
    return meds;
  }

  function isHighlighted(col, row) {
    if (!highlighter) return false;
    const parts = highlighter.split('-');
    return (
      parts[0] === columnLabel(col) && Number(parts[1]) === row
    );
  }

  return (
    <div className="overflow-auto">
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `auto repeat(${shelfColumns}, minmax(64px, 1fr))`,
        }}
      >
        {/* header row */}
        <div></div>
        {Array.from({ length: shelfColumns }).map((_, c) => (
          <div
            key={`h-${c}`}
            className="text-center font-extrabold text-sm text-[var(--text-secondary)]"
          >
            {columnLabel(c)}
          </div>
        ))}

        {/* body rows */}
        {Array.from({ length: shelfRows }).map((_, r) => (
          <React.Fragment key={`r-${r}`}>
            <div className="flex items-center justify-end pe-2 text-sm font-bold text-[var(--text-secondary)]">
              صف {r + 1}
            </div>
            {Array.from({ length: shelfColumns }).map((__, c) => {
              const meds = cellAt(c, r + 1);
              const highlight = isHighlighted(c, r + 1);
              const tooltip = meds
                .slice(0, 3)
                .map((m) => m.tradeName)
                .join(' • ');
              return (
                <div
                  key={`c-${c}-${r}`}
                  className={`shelf-cell ${highlight ? 'highlight' : ''}`}
                  title={tooltip || `${columnLabel(c)}-${r + 1}`}
                  aria-label={`رف ${columnLabel(c)}-${r + 1}: ${
                    meds.length
                  } صنف${highlight ? ' (محدد)' : ''}`}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[10px] text-[var(--text-secondary)]">
                      {columnLabel(c)}-{r + 1}
                    </span>
                    {meds.length > 0 && (
                      <span className="text-xs font-bold truncate max-w-full">
                        {meds[0].tradeName}
                      </span>
                    )}
                    {meds.length > 1 && (
                      <span className="text-[10px] text-[var(--text-secondary)]">
                        +{meds.length - 1}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {highlighter && (
        <p className="mt-3 text-sm text-[var(--text-secondary)] text-center">
          موقع الدواء المحدد:{' '}
          <span className="font-bold text-[var(--text-primary)]">
            {highlighter}
          </span>
        </p>
      )}
    </div>
  );
}
