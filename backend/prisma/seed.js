const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando poblamiento de datos esenciales...');

  console.log('Poblando tabla Faculty...');
  const faculties = [
    { name: 'Ingenieria' },
    { name: 'Ciencias y Tecnologia' },
    { name: 'Humanidades' },
    { name: 'Medicina' },
    { name: 'Derecho' },
    { name: 'Arquitectura' },
    { name: 'Todas' },
  ];

  for (const faculty of faculties) {
    const exists = await prisma.faculty.findFirst({
      where: { name: faculty.name, organizationId: null },
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
  const adminEmail = 'admin@pista8ideacion.com';
  const adminExists = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!adminExists) {
    await prisma.user.create({
      data: {
        id: 'admin-pista8ideacion',
        firebaseUid: '8D2VpCzukPQCN8c993Ifw4dvGo52',
        email: adminEmail,
        displayName: 'Admin Pista8',
        role: 'ADMIN',
      },
    });
    console.log(`Usuario admin creado: ${adminEmail}`);
  } else {
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });
    console.log('Usuario admin ya existe; rol y estado verificados');
  }

  console.log('Poblamiento finalizado con exito.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
