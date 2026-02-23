"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProposalStatusBadge } from "@/components/StatusBadge";

type Visit = { id: string; scheduledDate: string; client: { name: string }; user: { name: string } };

export default function NewProposalPage() {
  const searchParams = useSearchParams();
  const visitId = searchParams.get("visitId");
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    visitId: visitId || "",
    proposalDate: new Date().toISOString().slice(0, 10),
    responseStatus: "pending",
    notes: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/visits")
      .then((r) => r.json())
      .then((data) => {
        setVisits(data);
        if (visitId && !form.visitId) setForm((f) => ({ ...f, visitId }));
        else if (!form.visitId && data[0]) setForm((f) => ({ ...f, visitId: data[0].id }));
      })
      .catch(() => setVisits([]))
      .finally(() => setLoading(false));
  }, [visitId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.visitId) {
      setError("Please select a visit.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitId: form.visitId,
          proposalDate: new Date(form.proposalDate).toISOString(),
          responseStatus: form.responseStatus,
          notes: form.notes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create proposal.");
        return;
      }
      window.location.href = `/proposals/${data.id}`;
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
    <div className="p-6 md:p-8 max-w-lg">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/proposals"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">New Proposal</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Visit *</label>
          <select
            value={form.visitId}
            onChange={(e) => setForm((f) => ({ ...f, visitId: e.target.value }))}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select visit</option>
            {visits.map((v) => (
              <option key={v.id} value={v.id}>
                {v.client.name} – {new Date(v.scheduledDate).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Proposal Date *</label>
          <input
            type="date"
            value={form.proposalDate}
            onChange={(e) => setForm((f) => ({ ...f, proposalDate: e.target.value }))}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Response Status</label>
          <select
            value={form.responseStatus}
            onChange={(e) => setForm((f) => ({ ...f, responseStatus: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <Link
            href="/proposals"
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create Proposal"}
          </button>
        </div>
      </form>
    </div>
  );
}
