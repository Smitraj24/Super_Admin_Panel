export default function DataTable({ columns, data, onDelete }) {
  return (
    <table className="w-full border mt-4">
      <thead>
        <tr className="bg-gray-100">
          {columns.map((col) => (
            <th key={col} className="p-2 border text-left">
              {col.toUpperCase()}
            </th>
          ))}

          {onDelete && <th className="p-2 border">Action</th>}
        </tr>
      </thead>

      <tbody>
        {data.map((row) => (
          <tr key={row._id} className="hover:bg-gray-50">
            {columns.map((col) => (
              <td key={col} className="p-2 border">
                {row[col]}
              </td>
            ))}

            {onDelete && (
              <td className="p-2 border">
                <button
                  onClick={() => onDelete(row._id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
