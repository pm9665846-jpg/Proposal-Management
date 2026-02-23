"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, MapPin, Phone, Mail } from "lucide-react";

type Client = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  mapLocation: string | null;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    mapLocation: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => fetch("/api/clients").then((r) => r.json()).then(setClients).catch(() => setClients([]));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setForm({ name: "", address: "", phone: "", email: "", mapLocation: "" });
    setError("");
    setModal("create");
  };
  const openEdit = (c: Client) => {
    setForm({
      name: c.name,
      address: c.address ?? "",
      phone: c.phone ?? "",
      email: c.email ?? "",
      mapLocation: c.mapLocation ?? "",
    });
    setEditingId(c.id);
    setError("");
    setModal("edit");
  };
  const closeModal = () => {
    setModal(null);
    setEditingId(null);
    setError("");
  };

  const submit = async (e: React.FormEvent, isCreate: boolean) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const url = isCreate ? "/api/clients" : `/api/clients/${editingId}`;
      const res = await fetch(url, {
        method: isCreate ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.email?.[0] || data.error || "Request failed.");
        return;
      }
      closeModal();
      load();
    } catch {
      setError("Request failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this client? Visits linked to them will be removed.")) return;
    try {
      await fetch(`/api/clients/${id}`, { method: "DELETE" });
      load();
    } catch {
      alert("Failed to delete.");
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Clients</h1>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Client
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clients.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <h2 className="font-semibold text-slate-800 truncate">{c.name}</h2>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => openEdit(c)}
                  className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            {c.address && (
              <p className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="truncate">{c.address}</span>
              </p>
            )}
            {c.phone && (
              <p className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                <Phone className="w-4 h-4 shrink-0" />
                <a href={`tel:${c.phone}`} className="hover:text-primary-600">{c.phone}</a>
              </p>
            )}
            {c.email && (
              <p className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                <Mail className="w-4 h-4 shrink-0" />
                <a href={`mailto:${c.email}`} className="hover:text-primary-600 truncate">{c.email}</a>
              </p>
            )}
            {c.mapLocation && (
              <a
                href={c.mapLocation}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary-600 hover:underline"
              >
                <MapPin className="w-4 h-4" />
                View on Map
              </a>
            )}
            <Link
              href={`/visits?clientId=${c.id}`}
              className="mt-3 inline-block text-sm text-primary-600 hover:underline"
            >
              View visits →
            </Link>
          </div>
        ))}
      </div>
      {clients.length === 0 && (
        <p className="text-slate-500 text-center py-12">No clients yet. Add a client to assign visits.</p>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              {modal === "create" ? "Add Client" : "Edit Client"}
            </h2>
            <form onSubmit={(e) => submit(e, modal === "create")} className="space-y-4">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Google Map URL</label>
                <input
                  type="url"
                  value={form.mapLocation}
                  onChange={(e) => setForm((f) => ({ ...f, mapLocation: e.target.value }))}
                  placeholder="https://maps.google.com/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-60"
                >
                  {submitting ? "Saving..." : modal === "create" ? "Create" : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
