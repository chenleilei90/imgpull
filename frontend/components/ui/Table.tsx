export interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  minWidth = "min-w-full",
  rowKey
}: {
  columns: Column<T>[];
  data: T[];
  minWidth?: string;
  rowKey?: (item: T, index: number) => string;
}) {
  return (
    <div className="table-scroll rounded-panel border border-borderSoft bg-white shadow-soft">
      <table className={`${minWidth} border-separate border-spacing-0 text-sm`}>
        <thead>
          <tr className="bg-slate-50/90">
            {columns.map((column) => (
              <th key={column.key} className={`border-b border-borderSoft px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-slate-500 ${column.className ?? ""}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIndex) => (
            <tr key={rowKey ? rowKey(item, rowIndex) : rowIndex} className="transition duration-150 ease-out hover:bg-blue-50/45">
              {columns.map((column) => (
                <td key={column.key} className={`min-h-14 border-b border-borderSoft px-4 py-4 align-middle last:border-r-0 ${column.className ?? ""}`}>
                  {column.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
