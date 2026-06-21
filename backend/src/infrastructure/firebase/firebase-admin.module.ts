import { Module, Global } from '@nestjs/common';
import * as admin from 'firebase-admin';

export const FIREBASE_ADMIN_TOKEN = 'FIREBASE_ADMIN';

@Global()
@Module({
  providers: [
    {
      provide: FIREBASE_ADMIN_TOKEN,
      useFactory: () => {
        const configStr = process.env.FIREBASE_ADMIN_CONFIG;
        if (!configStr || configStr.includes('dummy')) {
          try {
            const fs = require('fs');
            const path = require('path');
            const fileConfig = fs.readFileSync(path.join(process.cwd(), 'firebase-admin.json'), 'utf8');
            const serviceAccount = JSON.parse(fileConfig) as admin.ServiceAccount;
            return admin.initializeApp({
              credential: admin.credential.cert(serviceAccount),
            });
          } catch (fileErr) {
            console.warn('⚠️ FIREBASE_ADMIN_CONFIG is not defined and firebase-admin.json not found. Mocking Firebase.');
            return {
              auth: () => ({
                verifyIdToken: async () => ({ uid: 'mock-uid' }),
              }),
              firestore: () => ({}),
              messaging: () => ({}),
            };
          }
        }
        
        try {
          // Esto lee el JSON directamente desde la variable de entorno que configuraste en Railway
          const serviceAccount = JSON.parse(configStr) as admin.ServiceAccount;
          return admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
        } catch (e) {
          console.warn('⚠️ Failed to initialize Firebase Admin SDK. Mocking it.', (e as Error).message);
          return {
            auth: () => ({
              verifyIdToken: async () => ({ uid: 'mock-uid' }),
            }),
          };
        }
      },
    },
  ],
  exports: [FIREBASE_ADMIN_TOKEN],
})
export class FirebaseAdminModule {}
