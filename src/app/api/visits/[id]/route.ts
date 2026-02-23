import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateVisitSchema = z.object({
  scheduledDate: z.string().optional(),
  status: z.enum(["pending", "completed", "cancelled", "rescheduled"]).optional(),
  meetingNotes: z.string().optional(),
  followUpDate: z.string().nullable().optional(),
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
  const visit = await prisma.visit.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      client: true,
      proposals: true,
    },
  });
  if (!visit) return NextResponse.json({ error: "Visit not found" }, { status: 404 });
  const role = (session.user as { role?: string }).role;
  if (role !== "admin" && visit.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(visit);
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
  const existing = await prisma.visit.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Visit not found" }, { status: 404 });
  const role = (session.user as { role?: string }).role;
  if (role !== "admin" && existing.userId !== session.user.id) {
    return NextResponse.json({ error: "You can only update visits assigned to you" }, { status: 403 });
  }
  const body = await request.json();
  const parsed = updateVisitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data: {
    scheduledDate?: Date;
    status?: string;
    meetingNotes?: string | null;
    followUpDate?: Date | null;
  } = {};
  if (parsed.data.scheduledDate != null) data.scheduledDate = new Date(parsed.data.scheduledDate);
  if (parsed.data.status != null) data.status = parsed.data.status;
  if (parsed.data.meetingNotes !== undefined) data.meetingNotes = parsed.data.meetingNotes ?? null;
  if (parsed.data.followUpDate !== undefined) data.followUpDate = parsed.data.followUpDate ? new Date(parsed.data.followUpDate) : null;
  const visit = await prisma.visit.update({
    where: { id },
    data,
    include: {
      user: { select: { id: true, name: true, email: true } },
      client: true,
      proposals: true,
    },
  });
  return NextResponse.json(visit);
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
  await prisma.visit.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
