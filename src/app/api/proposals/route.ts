import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createProposalSchema = z.object({
  visitId: z.string().min(1),
  proposalDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  responseStatus: z.enum(["pending", "accepted", "rejected"]).default("pending"),
  notes: z.string().optional(),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = (session.user as { role?: string }).role;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("responseStatus");

  const where: { responseStatus?: string; visit?: { userId: string } } = {};
  if (role !== "admin") {
    where.visit = { userId: session.user.id };
  }
  if (status) where.responseStatus = status;

  const proposals = await prisma.proposal.findMany({
    where,
    orderBy: { proposalDate: "desc" },
    include: {
      visit: {
        include: {
          user: { select: { id: true, name: true, email: true } },
          client: true,
        },
      },
    },
  });
  return NextResponse.json(proposals);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const parsed = createProposalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const visit = await prisma.visit.findUnique({ where: { id: parsed.data.visitId } });
  if (!visit) return NextResponse.json({ error: "Visit not found" }, { status: 400 });
  const existing = await prisma.proposal.findUnique({ where: { visitId: parsed.data.visitId } });
  if (existing) return NextResponse.json({ error: "Visit already has a proposal" }, { status: 400 });
  const proposalDate = new Date(parsed.data.proposalDate);
  const proposal = await prisma.proposal.create({
    data: {
      visitId: parsed.data.visitId,
      proposalDate,
      responseStatus: parsed.data.responseStatus,
      notes: parsed.data.notes ?? null,
    },
    include: {
      visit: {
        include: {
          user: { select: { id: true, name: true, email: true } },
          client: true,
        },
      },
    },
  });
  return NextResponse.json(proposal);
}
