import React from 'react';

export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No data available',
  pagination,
  onPageChange,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#e4ebe1] overflow-hidden shadow-card">
        <div className="p-12 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-[3px] border-[#336443] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#4b5b47] font-medium">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e4ebe1] overflow-hidden shadow-card flex flex-col">
      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)] relative scrollbar-thin">
        <table className="w-full text-left text-sm text-[#4b5b47]">
          <thead className="bg-[#f8faf7] text-[11px] uppercase font-bold text-[#4b5b47]/60 tracking-wider border-b border-[#e4ebe1] sticky top-0 z-10">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-6 py-3.5 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e4ebe1]/60">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-[#85AB8B] text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr key={row.id || rowIdx} className="hover:bg-[#f8faf7]/80 transition-colors duration-150">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`px-6 py-4 whitespace-nowrap ${col.className || ''}`}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.total > 0 && (
        <div className="px-6 py-3 border-t border-[#e4ebe1] flex items-center justify-between text-xs text-[#4b5b47] bg-[#f8faf7]/50">
          <span>
            Showing <strong className="font-semibold text-[#1f2a1d]">{data.length}</strong> of{' '}
            <strong className="font-semibold text-[#1f2a1d]">{pagination.total}</strong> results
          </span>
          <div className="flex gap-2">
            <button
              disabled={!pagination.hasPrev}
              onClick={() => onPageChange && onPageChange(pagination.page - 1)}
              className="px-3 py-1.5 border border-[#e4ebe1] rounded-lg bg-white hover:bg-[#f8faf7] disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-[#1f2a1d] transition-colors"
            >
              Previous
            </button>
            <button
              disabled={!pagination.hasNext}
              onClick={() => onPageChange && onPageChange(pagination.page + 1)}
              className="px-3 py-1.5 border border-[#e4ebe1] rounded-lg bg-white hover:bg-[#f8faf7] disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-[#1f2a1d] transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
