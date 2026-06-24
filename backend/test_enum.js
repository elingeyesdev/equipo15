const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const enumValues = await prisma.$queryRaw`SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE typname = 'UserRole'`;
  console.log("DB ENUM UserRole:", enumValues);
}

main().catch(console.error).finally(() => prisma.$disconnect());
