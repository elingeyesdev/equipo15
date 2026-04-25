
export const AdminStatsView = () => (
  <div>
    <h2>Resumen Global</h2>
    <p>KPIs de toda la plataforma (Users, Retos, Interacción).</p>
  </div>
);

export const AdminClientsView = () => (
  <div>
    <h2>Gestión Clientes</h2>
    <p>CRUD de Universidades y Empresas.</p>
  </div>
);

export const AdminAccessView = () => (
  <div>
    <h2>Configuración Accesos</h2>
    <p>Gestión a nivel de sistema: Listas blancas de dominios (ej. @univalle.edu), configuración de IPs y permisos globales.</p>
  </div>
);

export const AdminUsersView = () => (
  <div>
    <h2>Control Usuarios</h2>
    <p>Gestión de personas: Buscador de usuarios para asignar o revocar roles específicos (Admin, Juez, Company).</p>
  </div>
);

export const AdminSupportView = () => (
  <div>
    <h2>Soporte (Ghost)</h2>
    <p>Switcher para ver la plataforma como otro usuario.</p>
  </div>
);
