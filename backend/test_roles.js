const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.$queryRaw`SELECT DISTINCT role FROM "users"`;
  console.log("ROLES IN DB:", roles);
}

main().catch(console.error).finally(() => prisma.$disconnect());
