"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";
import {
  getHolidaysApi,
  addHolidayApi,
  deleteHolidayApi,
} from "../../../services/holidayApi";

export default function HolidayPage() {
  const [holidays, setHolidays] = useState([]);
  const [form, setForm] = useState({
    title: "",
    date: "",
    type: "",
    description: "",
  });

  const fetchHolidays = async () => {
    const res = await getHolidaysApi();
    setHolidays(res.data);
  };

  useEffect(() => {
    fetchHolidays();
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addHolidayApi(form);
    setForm({ title: "", date: "", type: "festival" });
    fetchHolidays();
  };

  const handleDelete = async (id) => {
    await deleteHolidayApi(id);
    fetchHolidays();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <Navbar />

      <main className="md:pl-64 pt-16 p-8">
        <h1 className="text-3xl font-bold mb-6">Holiday Management</h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl mb-8">
          <input
            placeholder="Holiday Title"
            className="border p-2 mr-4"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <input
            type="date"
            className="border p-2 mr-4"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />

          <select
            className="border p-2 mr-4"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="festival">Festival</option>
            <option value="national">National</option>
            <option value="company">Company</option>
          </select>

          <button className="bg-indigo-600 text-white px-4 py-2 rounded">
            Add Holiday
          </button>
        </form>

        <div className= "bg-white p-6 rounded-xl">
          {holidays.map((h) => (
            <div key={h._id} className="flex justify-between border-b py-3">
              <span>{h.title}</span>

              <span>{new Date(h.date).toDateString()}</span>

              <button
                onClick={() => handleDelete(h._id)}
                className="text-red-500"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
