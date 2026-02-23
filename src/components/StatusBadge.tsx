import clsx from "clsx";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200",
  rescheduled: "bg-blue-100 text-blue-800 border-blue-200",
  accepted: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

export function VisitStatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] ?? "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        style
      )}
    >
      {status}
    </span>
  );
}

export function ProposalStatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] ?? "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        style
      )}
    >
      {status}
    </span>
  );
}
