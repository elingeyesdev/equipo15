const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const judges = await prisma.user.findMany({
    where: { role: 'JUDGE' }
  });
  console.log('Judges:', judges);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
