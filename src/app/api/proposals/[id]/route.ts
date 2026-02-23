import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateProposalSchema = z.object({
  proposalDate: z.string().optional(),
  responseStatus: z.enum(["pending", "accepted", "rejected"]).optional(),
  notes: z.string().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      visit: {
        include: {
          user: { select: { id: true, name: true, email: true } },
          client: true,
        },
      },
    },
  });
  if (!proposal) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  const role = (session.user as { role?: string }).role;
  if (role !== "admin" && proposal.visit.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(proposal);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const existing = await prisma.proposal.findUnique({
    where: { id },
    include: { visit: true },
  });
  if (!existing) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  const role = (session.user as { role?: string }).role;
  if (role !== "admin" && existing.visit.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json();
  const parsed = updateProposalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data: { proposalDate?: Date; responseStatus?: string; notes?: string | null } = {};
  if (parsed.data.proposalDate != null) data.proposalDate = new Date(parsed.data.proposalDate);
  if (parsed.data.responseStatus != null) data.responseStatus = parsed.data.responseStatus;
  if (parsed.data.notes !== undefined) data.notes = parsed.data.notes ?? null;
  const proposal = await prisma.proposal.update({
    where: { id },
    data,
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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.proposal.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
