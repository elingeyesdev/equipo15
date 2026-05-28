import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando poblamiento de datos esenciales...');

  console.log('Poblando tabla Faculty...');
  const faculties = [
    { name: 'Ingeniería' },
    { name: 'Ciencias y Tecnología' },
    { name: 'Humanidades' },
    { name: 'Medicina' },
    { name: 'Derecho' },
    { name: 'Arquitectura' },
    { name: 'Todas' },
  ];

  for (const faculty of faculties) {
    const exists = await prisma.faculty.findFirst({
      where: { name: faculty.name, institutionId: null },
    });

    if (!exists) {
      await prisma.faculty.create({
        data: { name: faculty.name },
      });
      console.log(`Facultad creada: ${faculty.name}`);
    } else {
      console.log(`Facultad ya existe: ${faculty.name}`);
    }
  }

  console.log('Creando usuario admin de prueba...');
  const adminEmail = 'admin@univalle.edu';
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
