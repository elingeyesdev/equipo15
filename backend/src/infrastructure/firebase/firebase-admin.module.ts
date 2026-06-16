import { Module, Global } from '@nestjs/common';
import * as admin from 'firebase-admin';

export const FIREBASE_ADMIN_TOKEN = 'FIREBASE_ADMIN';

@Global()
@Module({
  providers: [
    {
      provide: FIREBASE_ADMIN_TOKEN,
      useFactory: () => {
        // Esto lee el JSON directamente desde la variable de entorno que configuraste en Railway
        const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CONFIG!) as admin.ServiceAccount;
        return admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      },
    },
  ],
  exports: [FIREBASE_ADMIN_TOKEN],
})
export class FirebaseAdminModule {}
