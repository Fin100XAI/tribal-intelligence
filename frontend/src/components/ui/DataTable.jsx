import { useMemo, useState } from 'react';
import { ChevronUp, ChevronDown, Search, ChevronsUpDown } from 'lucide-react';

// Reusable sortable + searchable table.
// columns: [{ key, label, align, render?, sortable?, className? }]
export default function DataTable({
  columns,
  rows,
  searchable = true,
  searchKeys,
  initialSort,
  pageSize = 0, // 0 = no pagination
  dense = false,
  emptyLabel = 'No records',
  onRowClick,
}) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState(initialSort || null); // { key, dir }
  const [page, setPage] = useState(0);

  const keys = searchKeys || columns.map((c) => c.key);

  const filtered = useMemo(() => {
    let r = rows || [];
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter((row) => keys.some((k) => String(row[k] ?? '').toLowerCase().includes(q)));
    }
    if (sort) {
      const { key, dir } = sort;
      r = [...r].sort((a, b) => {
        const av = a[key];
        const bv = b[key];
        if (typeof av === 'number' && typeof bv === 'number') return dir === 'asc' ? av - bv : bv - av;
        return dir === 'asc'
          ? String(av ?? '').localeCompare(String(bv ?? ''))
          : String(bv ?? '').localeCompare(String(av ?? ''));
      });
    }
    return r;
  }, [rows, query, sort, keys]);

  const paged = pageSize > 0 ? filtered.slice(page * pageSize, page * pageSize + pageSize) : filtered;
  const totalPages = pageSize > 0 ? Math.ceil(filtered.length / pageSize) : 1;

  const toggleSort = (key) => {
    setSort((s) => {
      if (!s || s.key !== key) return { key, dir: 'desc' };
      if (s.dir === 'desc') return { key, dir: 'asc' };
      return null;
    });
    setPage(0);
  };

  const pad = dense ? 'px-3 py-2' : 'px-3.5 py-2.5';

  return (
    <div>
      {searchable && (
        <div className="mb-3 relative max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Search table…"
            className="w-full rounded-lg border border-ink-200 bg-white pl-9 pr-3 py-2 text-sm placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-govblue-200 focus:border-govblue-300"
          />
        </div>
      )}
      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full min-w-[640px] text-sm border-collapse">
          <thead>
            <tr className="border-b border-ink-200">
              {columns.map((c) => {
                const active = sort?.key === c.key;
                const sortable = c.sortable !== false;
                return (
                  <th
                    key={c.key}
                    className={`${pad} text-[11px] font-semibold uppercase tracking-wide text-ink-400 ${
                      c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left'
                    } ${sortable ? 'cursor-pointer select-none hover:text-ink-600' : ''}`}
                    onClick={sortable ? () => toggleSort(c.key) : undefined}
                  >
                    <span className={`inline-flex items-center gap-1 ${c.align === 'right' ? 'flex-row-reverse' : ''}`}>
                      {c.label}
                      {sortable &&
                        (active ? (
                          sort.dir === 'asc' ? (
                            <ChevronUp size={12} />
                          ) : (
                            <ChevronDown size={12} />
                          )
                        ) : (
                          <ChevronsUpDown size={12} className="text-ink-200" />
                        ))}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-3 py-8 text-center text-sm text-ink-400">
                  {emptyLabel}
                </td>
              </tr>
            )}
            {paged.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-ink-50 last:border-0 transition-colors ${
                  onRowClick ? 'cursor-pointer hover:bg-govblue-50/40' : 'hover:bg-ink-50/50'
                }`}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={`${pad} align-middle ${
                      c.align === 'right' ? 'text-right tabular-nums' : c.align === 'center' ? 'text-center' : 'text-left'
                    } ${c.className || 'text-ink-700'}`}
                  >
                    {c.render ? c.render(row[c.key], row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pageSize > 0 && totalPages > 1 && (
        <div className="mt-3 flex items-center justify-between text-xs text-ink-400">
          <span>
            {filtered.length} records · page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-lg border border-ink-200 px-3 py-1.5 font-medium disabled:opacity-40 hover:bg-ink-50"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-lg border border-ink-200 px-3 py-1.5 font-medium disabled:opacity-40 hover:bg-ink-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
