"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProposalStatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";

type Proposal = {
  id: string;
  proposalDate: string;
  responseStatus: string;
  notes: string | null;
  visit: {
    id: string;
    scheduledDate: string;
    status: string;
    user: { id: string; name: string; email: string };
    client: { id: string; name: string };
  };
};

export default function ProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ responseStatus: "", notes: "", proposalDate: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/proposals/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        setProposal(data);
        setForm({
          responseStatus: data.responseStatus,
          notes: data.notes ?? "",
          proposalDate: format(new Date(data.proposalDate), "yyyy-MM-dd"),
        });
      })
      .catch(() => setProposal(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/proposals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responseStatus: form.responseStatus,
          notes: form.notes || null,
          proposalDate: new Date(form.proposalDate).toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Update failed.");
        return;
      }
      setProposal(data);
      setEditMode(false);
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
  if (!proposal) {
    return (
      <div className="p-8">
        <p className="text-slate-500">Proposal not found or you don’t have access.</p>
        <Link href="/proposals" className="mt-4 inline-block text-primary-600 hover:underline">
          ← Back to Proposals
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/proposals"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Proposal Details</h1>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm mb-6">
        <p className="text-slate-500 text-sm">Client</p>
        <p className="font-semibold text-slate-800">{proposal.visit.client.name}</p>
        <p className="text-slate-500 text-sm mt-2">Visit date</p>
        <p className="text-slate-800">{format(new Date(proposal.visit.scheduledDate), "MMM d, yyyy")}</p>
        <p className="text-slate-500 text-sm mt-2">Proposal date</p>
        <p className="text-slate-800">{format(new Date(proposal.proposalDate), "MMM d, yyyy")}</p>
        <p className="mt-2">
          <ProposalStatusBadge status={proposal.responseStatus} />
        </p>
        {proposal.notes && (
          <>
            <p className="text-slate-500 text-sm mt-3">Notes</p>
            <p className="text-slate-700 whitespace-pre-wrap">{proposal.notes}</p>
          </>
        )}
        <button
          onClick={() => setEditMode(true)}
          className="mt-4 text-sm text-primary-600 hover:underline font-medium"
        >
          Edit proposal
        </button>
      </div>

      {editMode && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">Edit Proposal</h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Proposal Date</label>
              <input
                type="date"
                value={form.proposalDate}
                onChange={(e) => setForm((f) => ({ ...f, proposalDate: e.target.value }))}
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
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-60"
              >
                {submitting ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      <Link
        href={`/my-visits/${proposal.visit.id}`}
        className="mt-6 inline-block text-primary-600 hover:underline"
      >
        View related visit →
      </Link>
    </div>
  );
}
