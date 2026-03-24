"use client";

import { useEffect, useState } from "react";
import { getHolidaysApi } from "../services/holidayApi";

export default function HolidayWidget() {
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const res = await getHolidaysApi();
      
      const currentYear = new Date().getFullYear();
      const yearHolidays = res.data
        .filter(
          (holiday) => new Date(holiday.date).getFullYear() === currentYear,
        )
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      setHolidays(yearHolidays);
    };

    fetch();
  }, []);

  return (
    <div className="bg-white p-6 rounded-3xl">
      <h3 className="text-lg font-bold mb-4">2026 Holidays</h3>

      {holidays.map((h) => (
        <div key={h._id} className="flex justify-between mb-2">
          <span>{h.title}</span>
          <span className="text-gray-400 text-sm">
            {new Date(h.date).toLocaleDateString()}
          </span>
        </div>
      ))}
    </div>
  );
}
