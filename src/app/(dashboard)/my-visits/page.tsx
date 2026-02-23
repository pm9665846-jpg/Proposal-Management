"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, ArrowLeft } from "lucide-react";
import { VisitStatusBadge } from "@/components/StatusBadge";
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
  proposals: Array<{ id: string; responseStatus: string }>;
};

export default function MyVisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/visits")
      .then((r) => r.json())
      .then(setVisits)
      .catch(() => setVisits([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dashboard"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">My Visits</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visits.map((v) => (
          <Link
            key={v.id}
            href={`/my-visits/${v.id}`}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-primary-200 transition block"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <h2 className="font-semibold text-slate-800 truncate">{v.client.name}</h2>
              <VisitStatusBadge status={v.status} />
            </div>
            <p className="flex items-center gap-2 text-sm text-slate-600 mb-1">
              <Calendar className="w-4 h-4 shrink-0" />
              {format(new Date(v.scheduledDate), "MMM d, yyyy HH:mm")}
            </p>
            {v.client.address && (
              <p className="flex items-center gap-2 text-sm text-slate-500 truncate">
                <MapPin className="w-4 h-4 shrink-0" />
                {v.client.address}
              </p>
            )}
            {v.proposals[0] && (
              <p className="mt-2 text-xs text-slate-500">
                Proposal: {v.proposals[0].responseStatus}
              </p>
            )}
            <p className="mt-3 text-sm text-primary-600 font-medium">View / Update →</p>
          </Link>
        ))}
      </div>
      {visits.length === 0 && (
        <p className="text-slate-500 text-center py-12">No visits assigned to you yet.</p>
      )}
    </div>
  );
}
