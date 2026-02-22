"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../../lib/api";

interface Length {
  id: string;
  label: string;
  inches: number;
  bodyLandmark: string;
  displayOrder: number;
  active: boolean;
}

export default function LengthsPage() {
  const [lengths, setLengths] = useState<Length[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ label: "", inches: 14, bodyLandmark: "shoulders", displayOrder: 0 });
  const router = useRouter();

  useEffect(() => { loadLengths(); }, []);

  async function loadLengths() {
    try {
      const data = await api.getAdminLengths();
      setLengths(data.lengths);
    } catch { router.push("/"); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await api.updateLength(editingId, form);
    } else {
      await api.createLength(form);
    }
    setShowForm(false);
    setEditingId(null);
    setForm({ label: "", inches: 14, bodyLandmark: "shoulders", displayOrder: 0 });
    await loadLengths();
  }

  function startEdit(length: Length) {
    setForm({ label: length.label, inches: length.inches, bodyLandmark: length.bodyLandmark, displayOrder: length.displayOrder });
    setEditingId(length.id);
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this length?")) return;
    await api.deleteLength(id);
    await loadLengths();
  }

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Muse Hair Pro Admin</h1>
          <div className="flex gap-4 text-sm">
            <Link href="/shades" className="text-gray-600 hover:text-gray-900">Shades</Link>
            <Link href="/lengths" className="font-semibold text-brand-600">Lengths</Link>
            <Link href="/textures" className="text-gray-600 hover:text-gray-900">Textures</Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Length Options</h2>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm({ label: "", inches: 14, bodyLandmark: "shoulders", displayOrder: 0 }); }}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Add Length
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 rounded-lg border bg-white p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Label</label>
                <input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} required className="mt-1 block w-full rounded border px-3 py-2" placeholder='e.g., 14 inches' />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Inches</label>
                <input type="number" value={form.inches} onChange={e => setForm({ ...form, inches: Number(e.target.value) })} required className="mt-1 block w-full rounded border px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Body Landmark</label>
                <select value={form.bodyLandmark} onChange={e => setForm({ ...form, bodyLandmark: e.target.value })} className="mt-1 block w-full rounded border px-3 py-2">
                  <option value="shoulders">Shoulders</option>
                  <option value="mid-back">Mid-back</option>
                  <option value="waist">Waist</option>
                  <option value="below waist">Below waist</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Display Order</label>
                <input type="number" value={form.displayOrder} onChange={e => setForm({ ...form, displayOrder: Number(e.target.value) })} className="mt-1 block w-full rounded border px-3 py-2" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="rounded bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">{editingId ? "Update" : "Create"}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="rounded border px-4 py-2 text-sm">Cancel</button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {lengths.map(length => (
            <div key={length.id} className={`flex items-center justify-between rounded-lg border bg-white p-4 ${!length.active ? "opacity-50" : ""}`}>
              <div>
                <span className="font-medium">{length.label}</span>
                <span className="ml-2 text-sm text-gray-500">{length.inches}" &mdash; {length.bodyLandmark}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => startEdit(length)} className="text-sm text-brand-600 hover:text-brand-700">Edit</button>
                <button onClick={() => handleDelete(length.id)} className="text-sm text-red-600 hover:text-red-700">Delete</button>
              </div>
            </div>
          ))}
          {lengths.length === 0 && <p className="py-8 text-center text-gray-500">No lengths yet. Add your first length option.</p>}
        </div>
      </div>
    </div>
  );
}
