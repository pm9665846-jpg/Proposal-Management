import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createVisitSchema = z.object({
  scheduledDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  userId: z.string().min(1),
  clientId: z.string().min(1),
  status: z.enum(["pending", "completed", "cancelled", "rescheduled"]).default("pending"),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = (session.user as { role?: string }).role;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const status = searchParams.get("status");

  const where: { userId?: string; status?: string } = {};
  if (role !== "admin" && session.user.id) {
    where.userId = session.user.id;
  } else if (userId) {
    where.userId = userId;
  }
  if (status) where.status = status;

  const visits = await prisma.visit.findMany({
    where,
    orderBy: { scheduledDate: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      client: true,
      proposals: true,
    },
  });
  return NextResponse.json(visits);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const parsed = createVisitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const scheduledDate = new Date(parsed.data.scheduledDate);
  const visit = await prisma.visit.create({
    data: {
      scheduledDate,
      userId: parsed.data.userId,
      clientId: parsed.data.clientId,
      status: parsed.data.status,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      client: true,
    },
  });
  return NextResponse.json(visit);
}
