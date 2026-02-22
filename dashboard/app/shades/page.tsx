"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../../lib/api";

interface Shade {
  id: string;
  name: string;
  hexColor: string;
  displayOrder: number;
  shopifyVariantId: string | null;
  active: boolean;
}

export default function ShadesPage() {
  const [shades, setShades] = useState<Shade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", hexColor: "#000000", displayOrder: 0, shopifyVariantId: "" });
  const router = useRouter();

  useEffect(() => {
    loadShades();
  }, []);

  async function loadShades() {
    try {
      const data = await api.getAdminShades();
      setShades(data.shades);
    } catch {
      router.push("/");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name,
      hexColor: form.hexColor,
      displayOrder: form.displayOrder,
      shopifyVariantId: form.shopifyVariantId || undefined,
    };

    if (editingId) {
      await api.updateShade(editingId, payload);
    } else {
      await api.createShade(payload);
    }

    setShowForm(false);
    setEditingId(null);
    setForm({ name: "", hexColor: "#000000", displayOrder: 0, shopifyVariantId: "" });
    await loadShades();
  }

  function startEdit(shade: Shade) {
    setForm({
      name: shade.name,
      hexColor: shade.hexColor,
      displayOrder: shade.displayOrder,
      shopifyVariantId: shade.shopifyVariantId || "",
    });
    setEditingId(shade.id);
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this shade?")) return;
    await api.deleteShade(id);
    await loadShades();
  }

  async function toggleActive(shade: Shade) {
    await api.updateShade(shade.id, { active: !shade.active });
    await loadShades();
  }

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Muse Hair Pro Admin</h1>
          <div className="flex gap-4 text-sm">
            <Link href="/shades" className="font-semibold text-brand-600">Shades</Link>
            <Link href="/lengths" className="text-gray-600 hover:text-gray-900">Lengths</Link>
            <Link href="/textures" className="text-gray-600 hover:text-gray-900">Textures</Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Shade Catalog</h2>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", hexColor: "#000000", displayOrder: 0, shopifyVariantId: "" }); }}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Add Shade
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 rounded-lg border bg-white p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="mt-1 block w-full rounded border px-3 py-2" placeholder="e.g., Jet Black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Color</label>
                <div className="mt-1 flex gap-2">
                  <input type="color" value={form.hexColor} onChange={e => setForm({ ...form, hexColor: e.target.value })} className="h-10 w-12 rounded border" />
                  <input value={form.hexColor} onChange={e => setForm({ ...form, hexColor: e.target.value })} className="block w-full rounded border px-3 py-2" placeholder="#000000" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Display Order</label>
                <input type="number" value={form.displayOrder} onChange={e => setForm({ ...form, displayOrder: Number(e.target.value) })} className="mt-1 block w-full rounded border px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Shopify Variant ID</label>
                <input value={form.shopifyVariantId} onChange={e => setForm({ ...form, shopifyVariantId: e.target.value })} className="mt-1 block w-full rounded border px-3 py-2" placeholder="Optional" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="rounded bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
                {editingId ? "Update" : "Create"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="rounded border px-4 py-2 text-sm">Cancel</button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {shades.map(shade => (
            <div key={shade.id} className={`flex items-center justify-between rounded-lg border bg-white p-4 ${!shade.active ? "opacity-50" : ""}`}>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full border" style={{ backgroundColor: shade.hexColor }} />
                <div>
                  <span className="font-medium">{shade.name}</span>
                  <span className="ml-2 text-sm text-gray-500">{shade.hexColor}</span>
                  {shade.shopifyVariantId && <span className="ml-2 text-xs text-gray-400">Variant: {shade.shopifyVariantId}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(shade)} className="text-sm text-gray-500 hover:text-gray-700">
                  {shade.active ? "Disable" : "Enable"}
                </button>
                <button onClick={() => startEdit(shade)} className="text-sm text-brand-600 hover:text-brand-700">Edit</button>
                <button onClick={() => handleDelete(shade.id)} className="text-sm text-red-600 hover:text-red-700">Delete</button>
              </div>
            </div>
          ))}
          {shades.length === 0 && <p className="py-8 text-center text-gray-500">No shades yet. Add your first shade to get started.</p>}
        </div>
      </div>
    </div>
  );
}
