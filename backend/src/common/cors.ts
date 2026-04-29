/**
 * Orígenes CORS permitidos — compartido entre HTTP (main.ts) y WebSocket (events.gateway.ts)
 *
 * Cubre:
 *  - localhost en cualquier puerto (desarrollo local)
 *  - Redes privadas RFC-1918: 192.168.x.x, 10.x.x.x, 172.16-31.x.x
 *    (miembros del equipo en distintas redes universitarias/corporativas)
 *  - Firebase Hosting (producción)
 */
export const CORS_ORIGINS: (string | RegExp)[] = [
  /^http:\/\/localhost:\d+$/,                           // localhost cualquier puerto
  /^http:\/\/192\.168\.\d+\.\d+:\d+$/,                 // red privada 192.168.x.x
  /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,                  // red privada 10.x.x.x
  /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+:\d+$/, // red privada 172.16-31.x.x
  'https://pista8-f8e6e.web.app',                       // Firebase Hosting (producción)
  'https://pista8.com',
];
