import { Module, Global } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

export const FIREBASE_ADMIN_TOKEN = 'FIREBASE_ADMIN';

@Global()
@Module({
  providers: [
    {
      provide: FIREBASE_ADMIN_TOKEN,
      useFactory: () => {
        const serviceAccount = JSON.parse(
          readFileSync(join(process.cwd(), 'firebase-admin.json'), 'utf8'),
        );
        return admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      },
    },
  ],
  exports: [FIREBASE_ADMIN_TOKEN],
})
export class FirebaseAdminModule {}
