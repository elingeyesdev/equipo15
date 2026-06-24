const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.$queryRaw`SELECT id, email, role, "displayName" FROM users WHERE "displayName" LIKE '%UNIVALLE%' OR "displayName" LIKE '%UPSA%'`;
  console.log("USERS:", users);
}

main().catch(console.error).finally(() => prisma.$disconnect());
