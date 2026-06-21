import * as admin from 'firebase-admin';
import * as fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./backend/firebase-admin.json', 'utf8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function listAllUsers(nextPageToken?: string) {
  try {
    const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
    listUsersResult.users.forEach((userRecord) => {
      console.log(userRecord.email, userRecord.uid);
    });
    if (listUsersResult.pageToken) {
      await listAllUsers(listUsersResult.pageToken);
    }
  } catch (error) {
    console.log('Error listing users:', error);
  }
}

listAllUsers();
