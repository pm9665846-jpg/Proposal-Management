import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [totalVisits, completedVisits, pendingVisits, totalProposals, proposalsByStatus, visitsByUser] = await Promise.all([
    prisma.visit.count(),
    prisma.visit.count({ where: { status: "completed" } }),
    prisma.visit.count({ where: { status: "pending" } }),
    prisma.proposal.count(),
    prisma.proposal.groupBy({
      by: ["responseStatus"],
      _count: true,
    }),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        _count: { select: { visits: true } },
        visits: {
          where: { status: "completed" },
          select: { id: true },
        },
      },
    }),
  ]);

  const employeePerformance = visitsByUser.map((u) => ({
    userId: u.id,
    name: u.name,
    email: u.email,
    totalVisits: u._count.visits,
    completedVisits: u.visits.length,
  }));

  const proposalCounts = proposalsByStatus.reduce(
    (acc, p) => ({ ...acc, [p.responseStatus]: p._count }),
    {} as Record<string, number>
  );

  return NextResponse.json({
    totalVisits,
    completedVisits,
    pendingVisits,
    totalProposals,
    proposalCounts: {
      accepted: proposalCounts.accepted ?? 0,
      rejected: proposalCounts.rejected ?? 0,
      pending: proposalCounts.pending ?? 0,
    },
    employeePerformance,
  });
}
