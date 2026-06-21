import { PrismaClient } from '@prisma/client';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const configStr = process.env.FIREBASE_ADMIN_CONFIG;
if (configStr && !configStr.includes('dummy')) {
  const serviceAccount = JSON.parse(configStr);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} else {
  const fileConfig = fs.readFileSync(path.join(process.cwd(), 'firebase-admin.json'), 'utf8');
  const serviceAccount = JSON.parse(fileConfig);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

async function cleanupFirebaseAuth() {
  console.log('Iniciando limpieza de Firebase Auth...');
  try {
    const dbUsers = await prisma.user.findMany({ select: { firebaseUid: true, email: true } });
    const dbUids = new Set(dbUsers.map(u => u.firebaseUid));
    console.log(`Usuarios en PostgreSQL: ${dbUids.size}`);

    let pageToken: string | undefined;
    let deletedCount = 0;

    do {
      const listUsersResult = await admin.auth().listUsers(1000, pageToken);
      for (const userRecord of listUsersResult.users) {
        if (!dbUids.has(userRecord.uid)) {
          console.log(`Eliminando usuario huerfano en Firebase: ${userRecord.email} (${userRecord.uid})`);
          await admin.auth().deleteUser(userRecord.uid);
          deletedCount++;
        }
      }
      pageToken = listUsersResult.pageToken;
    } while (pageToken);

    console.log(`Limpieza completada. Se eliminaron ${deletedCount} usuarios huérfanos de Firebase Auth.`);
  } catch (error) {
    console.error('Error durante la limpieza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupFirebaseAuth();
