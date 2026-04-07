import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- SEEDING ROLES ---');
  
  const roles = [
    { name: 'admin', description: 'Administrador del sistema' },
    { name: 'judge', description: 'Evaluador externo o experto' },
    { name: 'student', description: 'Participante estudiante' },
    { name: 'company', description: 'Empresa socia o patrocinadora' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
    console.log(`Rol asegurado: ${role.name}`);
  }

  console.log('--- SEEDING COMPLETED ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
