"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../../lib/api";

interface Texture {
  id: string;
  name: string;
  displayOrder: number;
  active: boolean;
}

export default function TexturesPage() {
  const [textures, setTextures] = useState<Texture[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", displayOrder: 0 });
  const router = useRouter();

  useEffect(() => { loadTextures(); }, []);

  async function loadTextures() {
    try {
      const data = await api.getAdminTextures();
      setTextures(data.textures);
    } catch { router.push("/"); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await api.updateTexture(editingId, form);
    } else {
      await api.createTexture(form);
    }
    setShowForm(false);
    setEditingId(null);
    setForm({ name: "", displayOrder: 0 });
    await loadTextures();
  }

  function startEdit(texture: Texture) {
    setForm({ name: texture.name, displayOrder: texture.displayOrder });
    setEditingId(texture.id);
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this texture?")) return;
    await api.deleteTexture(id);
    await loadTextures();
  }

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Muse Hair Pro Admin</h1>
          <div className="flex gap-4 text-sm">
            <Link href="/shades" className="text-gray-600 hover:text-gray-900">Shades</Link>
            <Link href="/lengths" className="text-gray-600 hover:text-gray-900">Lengths</Link>
            <Link href="/textures" className="font-semibold text-brand-600">Textures</Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Texture Options</h2>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", displayOrder: 0 }); }}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Add Texture
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 rounded-lg border bg-white p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="mt-1 block w-full rounded border px-3 py-2" placeholder="e.g., Straight" />
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
          {textures.map(texture => (
            <div key={texture.id} className={`flex items-center justify-between rounded-lg border bg-white p-4 ${!texture.active ? "opacity-50" : ""}`}>
              <span className="font-medium">{texture.name}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => startEdit(texture)} className="text-sm text-brand-600 hover:text-brand-700">Edit</button>
                <button onClick={() => handleDelete(texture.id)} className="text-sm text-red-600 hover:text-red-700">Delete</button>
              </div>
            </div>
          ))}
          {textures.length === 0 && <p className="py-8 text-center text-gray-500">No textures yet. Add your first texture option.</p>}
        </div>
      </div>
    </div>
  );
}
