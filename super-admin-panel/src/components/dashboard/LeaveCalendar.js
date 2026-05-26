"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

export default function LeaveCalendar({ leaves = [], holidays = [] }) {
  const today = new Date();

  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());

  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  // Sync date with selected month/year
  useEffect(() => {
    setCurrentDate(new Date(selectedYear, selectedMonth, 1));
  }, [selectedYear, selectedMonth]);

  // Calendar Info
  const { year, month, daysInMonth, firstDayOfMonth, monthName } =
    useMemo(() => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      return {
        year,
        month,
        daysInMonth: new Date(year, month + 1, 0).getDate(),
        firstDayOfMonth: new Date(year, month, 1).getDay(),
        monthName: currentDate.toLocaleDateString("en-US", {
          month: "long",
        }),
      };
    }, [currentDate]);

  // Available Years
  const availableYears = useMemo(() => {
    const years = new Set([
      today.getFullYear() - 1,
      today.getFullYear(),
      today.getFullYear() + 1,
    ]);

    leaves.forEach((leave) => {
      if (leave?.fromDate) {
        years.add(new Date(leave.fromDate).getFullYear());
      }

      if (leave?.toDate) {
        years.add(new Date(leave.toDate).getFullYear());
      }
    });

    return [...years].sort((a, b) => b - a);
  }, [leaves]);

  // Leaves Map
  const leavesByDate = useMemo(() => {
    const map = {};

    leaves.forEach((leave) => {
      if (!leave?.fromDate || !leave?.toDate) return;

      const from = new Date(leave.fromDate);
      const to = new Date(leave.toDate);

      for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
        if (d.getMonth() === month && d.getFullYear() === year) {
          const day = d.getDate();

          if (!map[day]) {
            map[day] = [];
          }

          const alreadyExists = map[day].find(
            (item) => item.userId === leave?.user?._id,
          );

          if (!alreadyExists) {
            map[day].push({
              userId: leave?.user?._id,
              name: leave?.user?.name || "Unknown",
              type: leave?.leaveType || "Leave",
              status: leave?.status || "PENDING",
              isHalfDay: leave?.isHalfDay || false,
            });
          }
        }
      }
    });

    return map;
  }, [leaves, month, year]);

  // Holidays Map
  const holidaysByDate = useMemo(() => {
    const map = {};

    holidays.forEach((holiday) => {
      if (!holiday?.date) return;

      const holidayDate = new Date(holiday.date);

      if (
        holidayDate.getMonth() === month &&
        holidayDate.getFullYear() === year
      ) {
        map[holidayDate.getDate()] = {
          title: holiday.title,
          type: holiday.type,
          description: holiday.description || "",
        };
      }
    });

    return map;
  }, [holidays, month, year]);

  // Month Names
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Navigation
  const goToPreviousMonth = () => {
    const newDate = new Date(year, month - 1, 1);

    setSelectedYear(newDate.getFullYear());
    setSelectedMonth(newDate.getMonth());
  };

  const goToNextMonth = () => {
    const newDate = new Date(year, month + 1, 1);

    setSelectedYear(newDate.getFullYear());
    setSelectedMonth(newDate.getMonth());
  };

  const goToToday = () => {
    const now = new Date();

    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth());
  };

  // Dropdown Handlers
  const handleYearChange = (e) => {
    setSelectedYear(Number(e.target.value));
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(Number(e.target.value));
  };

  // Holiday Background
  const getHolidayBg = (type) => {
    switch (type) {
      case "national":
        return "bg-orange-50";

      case "festival":
        return "bg-purple-50";

      case "company":
        return "bg-blue-50";

      default:
        return "bg-slate-50";
    }
  };

  // Render Calendar
  const renderCalendar = () => {
    const cells = [];

    const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - firstDayOfMonth + 1;

      const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;

      const isToday =
        isValidDay &&
        dayNumber === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

      const dayLeaves = isValidDay ? leavesByDate[dayNumber] || [] : [];

      const dayHoliday = isValidDay ? holidaysByDate[dayNumber] : null;

      cells.push(
        <div
          key={i}
          className={`min-h-[80px] border border-slate-100 p-1.5 transition-all
            ${
              isValidDay
                ? dayHoliday
                  ? `${getHolidayBg(dayHoliday.type)} hover:opacity-90`
                  : "bg-white hover:bg-slate-50"
                : "bg-slate-50"
            }
            ${isToday ? "ring-2 ring-indigo-300" : ""}
          `}
        >
          {isValidDay && (
            <>
              {/* Date */}
              <div className="flex items-center justify-between mb-1">
                <div
                  className={`text-xs font-semibold
                    ${isToday ? "text-indigo-600" : "text-slate-700"}
                  `}
                >
                  {dayNumber}
                </div>

                {dayHoliday && (
                  <div
                    className={`text-[8px] px-1 py-0.5 rounded font-semibold
                      ${
                        dayHoliday.type === "national"
                          ? "bg-orange-200 text-orange-800"
                          : dayHoliday.type === "festival"
                            ? "bg-purple-200 text-purple-800"
                            : "bg-blue-200 text-blue-800"
                      }
                    `}
                    title={dayHoliday.description || dayHoliday.title}
                  >
                    {dayHoliday.type === "national"
                      ? "🇮🇳"
                      : dayHoliday.type === "festival"
                        ? "🎉"
                        : "🏢"}
                  </div>
                )}
              </div>

              {/* Holiday */}
              {dayHoliday && (
                <div
                  className={`text-[9px] font-bold mb-1 truncate
                    ${
                      dayHoliday.type === "national"
                        ? "text-orange-700"
                        : dayHoliday.type === "festival"
                          ? "text-purple-700"
                          : "text-blue-700"
                    }
                  `}
                >
                  {dayHoliday.title}
                </div>
              )}

              {/* Leaves */}
              <div className="space-y-0.5">
                {dayLeaves.slice(0, dayHoliday ? 1 : 2).map((leave, index) => (
                  <div
                    key={index}
                    className={`text-[10px] px-1.5 py-0.5 rounded truncate
                        ${
                          leave.status === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : leave.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }
                      `}
                    title={`${leave.name} - ${leave.type}`}
                  >
                    {leave.name}
                  </div>
                ))}

                {dayLeaves.length > (dayHoliday ? 1 : 2) && (
                  <div className="text-[9px] text-slate-500 px-1">
                    +{dayLeaves.length - (dayHoliday ? 1 : 2)} more
                  </div>
                )}
              </div>
            </>
          )}
        </div>,
      );
    }

    return cells;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Calendar size={20} className="text-indigo-600" />

          <h3 className="text-base font-bold text-slate-900">
            {monthName} {year}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Year */}
          <select
            value={selectedYear}
            onChange={handleYearChange}
            className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-slate-700 font-medium"
          >
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>

          {/* Month */}
          <select
            value={selectedMonth}
            onChange={handleMonthChange}
            className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-slate-700 font-medium"
          >
            {monthNames.map((name, index) => (
              <option key={index} value={index}>
                {name}
              </option>
            ))}
          </select>

          {/* Today */}
          <button
            onClick={goToToday}
            className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium"
          >
            Today
          </button>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={goToPreviousMonth}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={18} className="text-slate-600" />
            </button>

            <button
              onClick={goToNextMonth}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronRight size={18} className="text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="p-3">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-slate-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-3 border-t border-slate-200 bg-slate-50">
        <div className="text-xs font-semibold text-slate-600">Leaves:</div>

        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-100 border border-green-200"></div>
          <span className="text-xs text-slate-600">Approved</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-200"></div>
          <span className="text-xs text-slate-600">Pending</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-100 border border-red-200"></div>
          <span className="text-xs text-slate-600">Rejected</span>
        </div>
      </div>
    </div>
  );
}
