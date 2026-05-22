# Whitelist: migrations & seed

Sigue estos pasos en tu máquina local para aplicar la migración y el seed que habilitan la tabla `allowed_domains` y crean un usuario admin de prueba.

Requisitos
- Base de datos PostgreSQL accesible (revisa `DATABASE_URL` en `backend/.env` o variables de entorno).
- Node.js, pnpm instalados.

Comandos (backend)
```bash
cd backend
# (1) Crear y aplicar migración (modo dev)
pnpm prisma migrate dev --name add_allowed_domains
# (2) Generar cliente Prisma
pnpm prisma generate
# (3) Ejecutar seed para poblar datos esenciales
pnpm prisma db seed
# (4) arrancar backend
pnpm run start:dev
```

Si la base de datos no está accesible (error P1001), usa:
```bash
cd backend
pnpm prisma migrate deploy
pnpm prisma generate
pnpm prisma db seed
pnpm run start:dev
```

Notas
- El `seed.ts` crea dominios por defecto: `univalle.edu`, `est.univalle.edu`, `pista8.com`.
- También crea un usuario admin con email `admin@univalle.edu` y `firebaseUid: admin-fb-0001`. Para usar ese admin en la app web, crea un usuario en Firebase Authentication con ese `firebaseUid` o modifica el usuario real en la tabla `users` para tener `role = 'ADMIN'`.

Acceso rápido en desarrollo
- Si quieres probar la UI sin ajustar roles, abre la ruta (solo en `DEV`): `http://localhost:5173/dashboard/dev/whitelist`
- Esta ruta carga directamente la vista `WhitelistManager` para añadir/quitar dominios.

Si quieres que yo ejecute los comandos aquí o prepare un script que automatice la migración en tu entorno, dime y lo preparo.