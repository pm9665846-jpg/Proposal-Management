"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Calendar, CheckCircle, Clock, FileText, Users } from "lucide-react";
import { VisitStatusBadge } from "@/components/StatusBadge";

type DashboardData = {
  totalVisits: number;
  completedVisits: number;
  pendingVisits: number;
  totalProposals: number;
  proposalCounts: { accepted: number; rejected: number; pending: number };
  employeePerformance: Array<{
    userId: string;
    name: string;
    email: string;
    totalVisits: number;
    completedVisits: number;
  }>;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to load");
      })
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // User role might not have dashboard API access (admin only). Show simple view.
  if (!data) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>
        <p className="text-slate-500">Dashboard metrics are available for admin users.</p>
      </div>
    );
  }

  const proposalPieData = [
    { name: "Accepted", value: data.proposalCounts.accepted, color: "#10b981" },
    { name: "Rejected", value: data.proposalCounts.rejected, color: "#ef4444" },
    { name: "Pending", value: data.proposalCounts.pending, color: "#f59e0b" },
  ].filter((d) => d.value > 0);

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Calendar className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Visits</p>
              <p className="text-2xl font-bold text-slate-800">{data.totalVisits}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Completed Visits</p>
              <p className="text-2xl font-bold text-slate-800">{data.completedVisits}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pending Visits</p>
              <p className="text-2xl font-bold text-slate-800">{data.pendingVisits}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 rounded-lg">
              <FileText className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Proposals</p>
              <p className="text-2xl font-bold text-slate-800">{data.totalProposals}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Proposal Response Status</h2>
          {proposalPieData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={proposalPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {proposalPieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No proposal data yet.</p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Employee Performance</h2>
          {data.employeePerformance.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.employeePerformance.map((e) => ({
                    name: e.name.split(" ")[0] || e.name,
                    total: e.totalVisits,
                    completed: e.completedVisits,
                  }))}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#0ea5e9" name="Total Visits" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No employee data yet.</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <h2 className="text-lg font-semibold text-slate-800 p-5 border-b border-slate-200 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Employee Visit Summary
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-left">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Total Visits</th>
                <th className="px-5 py-3 font-medium">Completed</th>
              </tr>
            </thead>
            <tbody>
              {data.employeePerformance.map((emp) => (
                <tr key={emp.userId} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-800">{emp.name}</td>
                  <td className="px-5 py-3 text-slate-600">{emp.email}</td>
                  <td className="px-5 py-3">{emp.totalVisits}</td>
                  <td className="px-5 py-3">{emp.completedVisits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
