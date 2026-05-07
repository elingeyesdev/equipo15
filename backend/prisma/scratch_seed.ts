import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const faculties = [
    'Ingeniería',
    'Ciencias y Tecnología',
    'Humanidades',
    'Medicina',
    'Derecho',
    'Arquitectura',
    'Todas'
  ];

  for (const name of faculties) {
    const exists = await prisma.faculty.findFirst({ where: { name } });
    if (!exists) {
      await prisma.faculty.create({ data: { name } });
      console.log(`Created: ${name}`);
    } else {
      console.log(`Exists: ${name}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
