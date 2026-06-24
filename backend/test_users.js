const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.$queryRaw`SELECT id, email, role, "displayName" FROM users`;
  console.log("USERS:");
  users.forEach(u => console.log(u));
}

main().catch(console.error).finally(() => prisma.$disconnect());
