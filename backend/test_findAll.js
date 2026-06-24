const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, displayName: true }
  });
  console.log("USERS:");
  users.forEach(u => console.log(u));

  const challenges = await prisma.challenge.findMany({
    select: { id: true, title: true, authorId: true }
  });
  console.log("CHALLENGES:");
  challenges.forEach(c => console.log(c));
}

main().catch(console.error).finally(() => prisma.$disconnect());
