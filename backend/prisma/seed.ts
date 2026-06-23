import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando poblamiento de datos esenciales...');



  console.log('Creando usuario admin de prueba...');
  const adminEmail = 'admin@pista8ideacion.com';
  const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!adminExists) {
    await prisma.user.create({
      data: {
        id: 'admin-0001',
        firebaseUid: 'admin-fb-0001',
        email: adminEmail,
        displayName: 'Admin Pista8',
        role: 'ADMIN',
      },
    });
    console.log(`Usuario admin creado: ${adminEmail}`);
  } else {
    console.log('Usuario admin ya existe');
  }
  console.log('Poblamiento finalizado con éxito.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
