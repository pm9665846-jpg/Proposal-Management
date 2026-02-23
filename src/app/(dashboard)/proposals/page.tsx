"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FileText, Calendar } from "lucide-react";
import { ProposalStatusBadge, VisitStatusBadge } from "@/components/StatusBadge";
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

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");

  const load = () => {
    const params = filterStatus ? `?responseStatus=${filterStatus}` : "";
    return fetch(`/api/proposals${params}`).then((r) => r.json()).then(setProposals).catch(() => setProposals([]));
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [filterStatus]);

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
        <h1 className="text-2xl font-bold text-slate-800">Proposal Tracking</h1>
        <Link
          href="/proposals/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
        >
          <Plus className="w-5 h-5" />
          New Proposal
        </Link>
      </div>

      <div className="mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-left">
                <th className="px-5 py-3 font-medium">Proposal Date</th>
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Visit Date</th>
                <th className="px-5 py-3 font-medium">Response</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((p) => (
                <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-800 whitespace-nowrap">
                    {format(new Date(p.proposalDate), "MMM d, yyyy")}
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-800">{p.visit.client.name}</td>
                  <td className="px-5 py-3 text-slate-600 whitespace-nowrap">
                    {format(new Date(p.visit.scheduledDate), "MMM d, yyyy")}
                  </td>
                  <td className="px-5 py-3">
                    <ProposalStatusBadge status={p.responseStatus} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/proposals/${p.id}`}
                      className="text-primary-600 hover:underline font-medium"
                    >
                      View / Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {proposals.length === 0 && (
          <p className="text-slate-500 text-center py-8">No proposals yet.</p>
        )}
      </div>
    </div>
  );
}
