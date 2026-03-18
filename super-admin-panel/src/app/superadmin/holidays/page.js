"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";
import {
  getHolidaysApi,
  addHolidayApi,
  updateHolidayApi,
  deleteHolidayApi,
} from "../../../services/holidayApi";

export default function HolidayPage() {
  const [holidays, setHolidays] = useState([]);
  const [form, setForm] = useState({
    title: "",
    date: "",
    type: "festival",
    description: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    date: "",
    type: "festival",
    description: "",
  });

  const fetchHolidays = async () => {
    const res = await getHolidaysApi();
    setHolidays(res.data);
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addHolidayApi(form);
    setForm({ title: "", date: "", type: "festival", description: "" });
    fetchHolidays();
  };

  const handleEdit = (holiday) => {
    setEditingId(holiday._id);
    setEditForm({
      title: holiday.title,
      date: holiday.date.split("T")[0],
      type: holiday.type,
      description: holiday.description || "",
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await updateHolidayApi(editingId, editForm);
    setEditingId(null);
    setEditForm({ title: "", date: "", type: "festival", description: "" });
    fetchHolidays();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this holiday?")) {
      await deleteHolidayApi(id);
      fetchHolidays();
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ title: "", date: "", type: "festival", description: "" });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <Navbar />

      <main className="md:pl-64 pt-16 p-8">
        <h1 className="text-3xl font-bold mb-6">Holiday Management</h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Holiday</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              placeholder="Holiday Title"
              className="border p-2 rounded"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />

            <input
              type="date"
              className="border p-2 rounded"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />

            <select
              className="border p-2 rounded"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="festival">Festival</option>
              <option value="national">National</option>
              <option value="company">Company</option>
            </select>

            <input
              placeholder="Description (optional)"
              className="border p-2 rounded"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded mt-4 hover:bg-indigo-700">
            Add Holiday
          </button>
        </form>

        {editingId && (
          <form
            onSubmit={handleUpdate}
            className="bg-yellow-50 p-6 rounded-xl mb-8 border-l-4 border-yellow-400"
          >
            <h2 className="text-xl font-semibold mb-4">Edit Holiday</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input
                placeholder="Holiday Title"
                className="border p-2 rounded"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
                required
              />

              <input
                type="date"
                className="border p-2 rounded"
                value={editForm.date}
                onChange={(e) =>
                  setEditForm({ ...editForm, date: e.target.value })
                }
                required
              />

              <select
                className="border p-2 rounded"
                value={editForm.type}
                onChange={(e) =>
                  setEditForm({ ...editForm, type: e.target.value })
                }
              >
                <option value="festival">Festival</option>
                <option value="national">National</option>
                <option value="company">Company</option>
              </select>

              <input
                placeholder="Description (optional)"
                className="border p-2 rounded"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
              />
            </div>
            <div className="mt-4 space-x-2">
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Update Holiday
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="bg-white p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Holiday List</h2>
          {holidays.length === 0 ? (
            <p className="text-gray-500">No holidays found.</p>
          ) : (
            <div className="space-y-3">
              {holidays.map((h) => (
                <div
                  key={h._id}
                  className="flex flex-col md:flex-row md:justify-between md:items-center border-b py-3 "
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{h.title}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(h.date).toDateString()}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{h.type}</p>
                    {h.description && (
                      <p className="text-xs text-gray-500">{h.description}</p>
                    )}
                  </div>
                  <div className="space-x-2 mt-2 md:mt-0 flex md:flex overflow-hidden">
                    <button
                      onClick={() => handleEdit(h)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(h._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
