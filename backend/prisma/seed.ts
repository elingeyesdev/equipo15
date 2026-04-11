import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando poblamiento de datos para la demostración...');

  const existingUser = await prisma.user.findFirst();
  
  if (!existingUser) {
    console.error('Error: No hay usuarios en la base de datos. Por favor logueate en la app primero para crear tu usuario.');
    return;
  }

  const retoTodas = await prisma.challenge.create({
    data: {
      title: 'Innovación Abierta para el Futuro Sostenible',
      problemDescription: 'Buscamos propuestas multidisciplinarias para reducir la brecha de digitalización en procesos comunitarios. Todas las ideas son bienvenidas.',
      status: 'Activo',
      isPrivate: false,
      startDate: new Date(),
      publicationDate: new Date(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      facultyId: null,
      authorId: existingUser.id,
    }
  });

  console.log('Reto creado: Todas las Facultades');

  const retoMedicina = await prisma.challenge.create({
    data: {
      title: 'Optimización de Telemedicina en Áreas Rurales',
      problemDescription: '¿Cómo podríamos mejorar la atención primaria a través de herramientas de telemedicina para sectores con conectividad inestable?',
      status: 'Activo',
      isPrivate: false,
      startDate: new Date(),
      publicationDate: new Date(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      facultyId: 4,
      authorId: existingUser.id,
    }
  });

  console.log('Reto creado: Facultad de Medicina');

  const ideasMockData = [
    { title: 'Plataforma comunitaria offline', challengeId: retoTodas.id, likes: 25, comments: 2 },
    { title: 'Red de trueque digital', challengeId: retoTodas.id, likes: 10, comments: 8 },
    { title: 'Sensores IoT ambientales', challengeId: retoTodas.id, likes: 45, comments: 12 },
    { title: 'App de movilidad compartida local', challengeId: retoTodas.id, likes: 15, comments: 1 },
    { title: 'Educación cívica gamificada', challengeId: retoTodas.id, likes: 60, comments: 22 },
    { title: 'Energía solar en paradas de bus', challengeId: retoTodas.id, likes: 33, comments: 4 },
    { title: 'Blockchain para transparencia ONG', challengeId: retoTodas.id, likes: 18, comments: 7 },
    { title: 'Kits de agricultura hidropónica', challengeId: retoTodas.id, likes: 20, comments: 2 },
    { title: 'Reducción de plásticos AI', challengeId: retoTodas.id, likes: 70, comments: 25 },
    { title: 'Mercado de créditos de carbono', challengeId: retoTodas.id, likes: 5, comments: 0 },
    { title: 'Fábrica de bioplásticos locales', challengeId: retoTodas.id, likes: 42, comments: 8 },
    { title: 'Filtros de agua de bajo costo', challengeId: retoTodas.id, likes: 55, comments: 15 },
    { title: 'Programa mentores comunitarios', challengeId: retoTodas.id, likes: 8, comments: 3 },
    { title: 'Comedor ecológico autosostenible', challengeId: retoTodas.id, likes: 27, comments: 6 },
    { title: 'Aplicación de reciclaje inteligente', challengeId: retoTodas.id, likes: 38, comments: 10 },

    { title: 'Protocolo de compresión de imágenes DICOM', challengeId: retoMedicina.id, likes: 30, comments: 5 },
    { title: 'Consultas asíncronas vía SMS', challengeId: retoMedicina.id, likes: 50, comments: 14 },
    { title: 'App para monitoreo de signos offline', challengeId: retoMedicina.id, likes: 22, comments: 2 },
    { title: 'Botiquín inteligente con alertas IoT', challengeId: retoMedicina.id, likes: 12, comments: 1 },
    { title: 'Triaje automatizado por IA ligera', challengeId: retoMedicina.id, likes: 65, comments: 18 },
    { title: 'Capacitación en VR para brigadistas', challengeId: retoMedicina.id, likes: 40, comments: 9 },
    { title: 'Mochila de diagnósticos solares', challengeId: retoMedicina.id, likes: 80, comments: 20 },
  ];

  for (const mock of ideasMockData) {
    await prisma.idea.create({
      data: {
        title: mock.title,
        problem: 'Problema de ejemplo estructurado.',
        solution: 'Solución propuesta con viabilidad a corto plazo.',
        status: 'public',
        likesCount: mock.likes,
        commentsCount: mock.comments,
        authorId: existingUser.id,
        challengeId: mock.challengeId,
      }
    });
  }

  console.log(`Mural poblado ${ideasMockData.length} ideas volando han sido creadas exitosamente.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
