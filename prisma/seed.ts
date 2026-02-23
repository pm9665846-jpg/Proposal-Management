const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await hash("admin123", 12);
  const userPassword = await hash("user123", 12);

  const admin = await prisma.admin.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: adminPassword,
      name: "System Admin",
    },
  });
  console.log("Admin:", admin.email);

  const user1 = await prisma.user.upsert({
    where: { email: "john@example.com" },
    update: {},
    create: {
      email: "john@example.com",
      password: userPassword,
      name: "John Doe",
      role: "user",
    },
  });
  const user2 = await prisma.user.upsert({
    where: { email: "jane@example.com" },
    update: {},
    create: {
      email: "jane@example.com",
      password: userPassword,
      name: "Jane Smith",
      role: "user",
    },
  });
  console.log("Users:", user1.email, user2.email);

  const existingClient1 = await prisma.client.findFirst({ where: { name: "Acme Corp" } });
  const client1 = existingClient1 || await prisma.client.create({
    data: {
      name: "Acme Corp",
      address: "123 Business Ave, City",
      phone: "+1 555-0100",
      email: "contact@acme.example.com",
      mapLocation: "https://maps.google.com/?q=123+Business+Ave",
    },
  });
  const existingClient2 = await prisma.client.findFirst({ where: { name: "Tech Solutions Ltd" } });
  const client2 = existingClient2 || await prisma.client.create({
    data: {
      name: "Tech Solutions Ltd",
      address: "456 Innovation Rd",
      phone: "+1 555-0200",
      email: "info@techsolutions.example.com",
      mapLocation: null,
    },
  });
  console.log("Clients:", client1.name, client2.name);

  const existingVisit1 = await prisma.visit.findFirst({
    where: { userId: user1.id, clientId: client1.id },
  });
  const visit1 = existingVisit1 || await prisma.visit.create({
    data: {
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: "pending",
      userId: user1.id,
      clientId: client1.id,
    },
  });
  const existingVisit2 = await prisma.visit.findFirst({
    where: { userId: user2.id, clientId: client2.id },
  });
  const visit2 = existingVisit2 || await prisma.visit.create({
    data: {
      scheduledDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: "completed",
      meetingNotes: "Discussed Q2 requirements. Follow-up next week.",
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userId: user2.id,
      clientId: client2.id,
    },
  });
  console.log("Visits created");

  const existingProposal = await prisma.proposal.findFirst({
    where: { visitId: visit2.id },
  });
  if (!existingProposal) {
    await prisma.proposal.create({
      data: {
        visitId: visit2.id,
        proposalDate: new Date(),
        responseStatus: "pending",
        notes: "Proposal sent. Awaiting response.",
      },
    });
    console.log("Proposal created");
  }

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
