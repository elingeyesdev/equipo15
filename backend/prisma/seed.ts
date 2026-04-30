import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando poblamiento de datos esenciales (Roles)...');

  const roles = [
    {
      name: 'admin',
      description: 'Admin: Asigna roles (a los judge en específico se les asigna a un reto, pueden ser varios retos para un judge).'
    },
    {
      name: 'company',
      description: 'Compañía: Lanza retos y tiene un dashboard para ver interacciones (personas, likes, comentarios).'
    },
    {
      name: 'judge',
      description: 'Juez: Visualización de un reto en específico y uso de métricas de calificación (Factible, Viable económicamente, Deseable).'
    },
    {
      name: 'student',
      description: 'Estudiante: Ve los retos que se lanzaron y postula ideas en los retos.'
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: {
        name: role.name,
        description: role.description,
      },
    });
    console.log(`Rol verificado/creado: ${role.name}`);
  }

  console.log('---');
  console.log('Nota sobre Facultades:');
  console.log('Las facultades (Ingeniería, Medicina, Gastronomía, Arquitectura, Derecho, Todas) no son una tabla en PostgreSQL, sino que se manejan en código como diccionarios (faculty.dictionary.ts) asignando el ID correspondiente.');
  console.log('---');

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
