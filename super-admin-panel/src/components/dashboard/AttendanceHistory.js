export default function AttendanceHistory({ attendanceHistory }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900">
          Attendance History
        </h3>
        <div className="flex items-center gap-3">
          <input
            type="date"
            defaultValue={new Date().toISOString().split("T")[0]}
            className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button className="text-sm bg-slate-100 hover:bg-slate-200 px-4 py-1.5 rounded-lg font-medium transition">
            Filter
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                Date
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                Entry Time
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                Exit Time
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                Breaks
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                Total Break Time
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                Working Hours
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                Status
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                User Details
              </th>
            </tr>
          </thead>
          <tbody>
            {attendanceHistory.map((record, index) => (
              <tr
                key={index}
                className="border-b border-slate-100 hover:bg-slate-50 transition"
              >
                <td className="py-4 px-4 text-sm text-slate-700">
                  {record.date}
                </td>
                <td className="py-4 px-4 text-sm text-green-600 font-semibold">
                  {record.entryTime}
                </td>
                <td className="py-4 px-4 text-sm text-slate-500">
                  {record.exitTime}
                </td>
                <td className="py-4 px-4 text-sm text-blue-600">
                  {record.breaks}
                </td>
                <td className="py-4 px-4 text-sm text-slate-700">
                  {record.totalBreakTime}
                </td>
                <td className="py-4 px-4 text-sm text-slate-500">
                  {record.workingHours}
                </td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    {record.status}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm">
                    <div className="text-blue-600 font-medium">
                      {record.userEmail}
                    </div>
                    <div className="text-slate-500 text-xs">
                      {record.userName}
                    </div>
                    <div className="text-slate-400 text-xs">
                      ID: {record.userId}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
