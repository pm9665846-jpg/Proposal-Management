"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Mail, Calendar } from "lucide-react";
import { VisitStatusBadge, ProposalStatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";

type Visit = {
  id: string;
  scheduledDate: string;
  status: string;
  meetingNotes: string | null;
  followUpDate: string | null;
  user: { id: string; name: string; email: string };
  client: {
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    mapLocation: string | null;
  };
  proposals: Array<{
    id: string;
    proposalDate: string;
    responseStatus: string;
    notes: string | null;
  }>;
};

export default function VisitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    status: "",
    meetingNotes: "",
    followUpDate: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/visits/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        setVisit(data);
        setForm({
          status: data.status,
          meetingNotes: data.meetingNotes ?? "",
          followUpDate: data.followUpDate ? format(new Date(data.followUpDate), "yyyy-MM-dd") : "",
        });
      })
      .catch(() => setVisit(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/visits/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: form.status,
          meetingNotes: form.meetingNotes || null,
          followUpDate: form.followUpDate ? new Date(form.followUpDate).toISOString() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.status?.[0] || data.error || "Update failed.");
        return;
      }
      setVisit(data);
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
  if (!visit) {
    return (
      <div className="p-8">
        <p className="text-slate-500">Visit not found or you don’t have access.</p>
        <Link href="/my-visits" className="mt-4 inline-block text-primary-600 hover:underline">
          ← Back to My Visits
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/my-visits"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Visit Details</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-3">Client</h2>
          <p className="font-medium text-slate-800">{visit.client.name}</p>
          {visit.client.address && (
            <p className="flex items-center gap-2 text-sm text-slate-600 mt-1">
              <MapPin className="w-4 h-4 shrink-0" />
              {visit.client.address}
            </p>
          )}
          {visit.client.phone && (
            <p className="flex items-center gap-2 text-sm text-slate-600 mt-1">
              <Phone className="w-4 h-4 shrink-0" />
              <a href={`tel:${visit.client.phone}`} className="hover:text-primary-600">{visit.client.phone}</a>
            </p>
          )}
          {visit.client.email && (
            <p className="flex items-center gap-2 text-sm text-slate-600 mt-1">
              <Mail className="w-4 h-4 shrink-0" />
              <a href={`mailto:${visit.client.email}`} className="hover:text-primary-600">{visit.client.email}</a>
            </p>
          )}
          {visit.client.mapLocation && (
            <a
              href={visit.client.mapLocation}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary-600 hover:underline mt-2"
            >
              <MapPin className="w-4 h-4" />
              Open in Google Maps
            </a>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-3">Schedule</h2>
          <p className="flex items-center gap-2 text-slate-700">
            <Calendar className="w-4 h-4" />
            {format(new Date(visit.scheduledDate), "MMM d, yyyy 'at' HH:mm")}
          </p>
          <p className="mt-2">
            <span className="text-slate-500">Status: </span>
            <VisitStatusBadge status={visit.status} />
          </p>
          {visit.followUpDate && (
            <p className="mt-2 text-sm text-slate-600">
              Follow-up: {format(new Date(visit.followUpDate), "MMM d, yyyy")}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="font-semibold text-slate-800 mb-3">Meeting Notes</h2>
        {!editMode ? (
          <>
            <p className="text-slate-600 whitespace-pre-wrap">{visit.meetingNotes || "—"}</p>
            <button
              onClick={() => setEditMode(true)}
              className="mt-3 text-sm text-primary-600 hover:underline font-medium"
            >
              Update visit
            </button>
          </>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
            )}
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
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Meeting Notes</label>
              <textarea
                value={form.meetingNotes}
                onChange={(e) => setForm((f) => ({ ...f, meetingNotes: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Follow-up Date</label>
              <input
                type="date"
                value={form.followUpDate}
                onChange={(e) => setForm((f) => ({ ...f, followUpDate: e.target.value }))}
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
        )}
      </div>

      {visit.proposals.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-3">Proposal</h2>
          {visit.proposals.map((p) => (
            <div key={p.id} className="flex items-center gap-3">
              <ProposalStatusBadge status={p.responseStatus} />
              <span className="text-sm text-slate-600">
                {format(new Date(p.proposalDate), "MMM d, yyyy")}
              </span>
              <Link href={`/proposals?visitId=${visit.id}`} className="text-sm text-primary-600 hover:underline">
                View proposal
              </Link>
            </div>
          ))}
        </div>
      )}

      {visit.proposals.length === 0 && (
        <div className="mt-6">
          <Link
            href={`/proposals/new?visitId=${visit.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
          >
            Add proposal for this visit
          </Link>
        </div>
      )}
    </div>
  );
}
