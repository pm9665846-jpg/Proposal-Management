"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Calendar, MapPin, User } from "lucide-react";
import { VisitStatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";

type UserOption = { id: string; name: string; email: string };
type ClientOption = { id: string; name: string; address: string | null; phone: string | null; email: string | null };
type Visit = {
  id: string;
  scheduledDate: string;
  status: string;
  userId: string;
  clientId: string;
  user: UserOption;
  client: ClientOption;
};

export default function VisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ scheduledDate: "", userId: "", clientId: "", status: "pending" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filterUser, setFilterUser] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const loadVisits = () => {
    const params = new URLSearchParams();
    if (filterUser) params.set("userId", filterUser);
    if (filterStatus) params.set("status", filterStatus);
    return fetch(`/api/visits?${params}`).then((r) => r.json()).then(setVisits).catch(() => setVisits([]));
  };

  useEffect(() => {
    Promise.all([
      loadVisits(),
      fetch("/api/users").then((r) => r.json()).then(setUsers).catch(() => []),
      fetch("/api/clients").then((r) => r.json()).then(setClients).catch(() => []),
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) loadVisits();
  }, [filterUser, filterStatus]);

  const openCreate = () => {
    setForm({
      scheduledDate: new Date().toISOString().slice(0, 16),
      userId: users[0]?.id ?? "",
      clientId: clients[0]?.id ?? "",
      status: "pending",
    });
    setError("");
    setModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.userId || !form.clientId) {
      setError("Please select user and client.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledDate: new Date(form.scheduledDate).toISOString(),
          userId: form.userId,
          clientId: form.clientId,
          status: form.status,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.userId?.[0] || data.error || "Failed to create visit.");
        return;
      }
      setModal(false);
      loadVisits();
    } catch {
      setError("Request failed.");
    } finally {
      setSubmitting(false);
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
        <h1 className="text-2xl font-bold text-slate-800">Visit Planning</h1>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
        >
          <Plus className="w-5 h-5" />
          Assign Visit
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">All users</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="rescheduled">Rescheduled</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-left">
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Assigned To</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((v) => (
                <tr key={v.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-800 whitespace-nowrap">
                    {format(new Date(v.scheduledDate), "MMM d, yyyy HH:mm")}
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-medium text-slate-800">{v.client.name}</span>
                    {v.client.address && (
                      <p className="text-xs text-slate-500 truncate max-w-[180px]">{v.client.address}</p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{v.user.name}</td>
                  <td className="px-5 py-3">
                    <VisitStatusBadge status={v.status} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/my-visits/${v.id}`}
                      className="text-primary-600 hover:underline font-medium"
                    >
                      View / Update
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {visits.length === 0 && (
          <p className="text-slate-500 text-center py-8">No visits yet. Assign a visit to get started.</p>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Assign Visit</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Scheduled Date & Time *</label>
                <input
                  type="datetime-local"
                  value={form.scheduledDate}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assign to User *</label>
                <select
                  value={form.userId}
                  onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select user</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Client *</label>
                <select
                  value={form.clientId}
                  onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rescheduled">Rescheduled</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-60"
                >
                  {submitting ? "Creating..." : "Assign Visit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
