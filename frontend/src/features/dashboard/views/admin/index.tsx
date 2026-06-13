import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { breakpoints } from '../../../../config/theme';
import { toast } from 'sonner';
import { useAuth } from '../../../../context/AuthContext';
import { adminService } from '../../../../services/admin.service';
import type { CompanySupportItem } from '../../../../types/models';
import { premiumTooltip } from '../../styles/CommonStyles';
import { getStoredImpersonationToken } from '../../../../utils/impersonation-session';
import { StudentReputationModal } from './StudentReputationModal';

export { AdminStatsView } from './AdminStatsView';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const ViewShell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  animation: ${fadeUp} 0.4s ease both;
`;

const EvalBtn = styled.button<{ $tooltipText?: string }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(254, 65, 10, 0.18);
  background: #fe410a;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  color: white;
  box-shadow: 0 2px 8px rgba(254, 65, 10, 0.18);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(254, 65, 10, 0.28);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(254, 65, 10, 0.18);
  }

  ${premiumTooltip}
`;

const Panel = styled.section`
  background: white;
  border-radius: 24px;
  border: 1px solid rgba(72, 80, 84, 0.08);
  box-shadow: 0 10px 30px rgba(72, 80, 84, 0.06);
  overflow: hidden;
`;

const PanelHeader = styled.div`
  padding: 22px 24px 18px;
  border-bottom: none;
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;

  @media (max-width: ${breakpoints.tablet}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ReadOnlyBanner = styled.div`
  margin: 0 24px 18px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid rgba(245, 158, 11, 0.22);
  background: linear-gradient(180deg, rgba(245, 158, 11, 0.12), rgba(254, 65, 10, 0.05));
  color: #7c4a13;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
`;

const ReadOnlyBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(245, 158, 11, 0.16);
  color: #a16207;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Eyebrow = styled.span`
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #fe410a;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 22px;
  font-weight: 900;
  color: #1a1f22;
`;

const Description = styled.p`
  margin: 0;
  color: #5b6470;
  line-height: 1.6;
  max-width: 760px;
`;

const SearchInput = styled.input<{ $tooltipText?: string }>`
  min-width: 280px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(72, 80, 84, 0.14);
  font-size: 14px;
  outline: none;
  &:focus {
    border-color: #fe410a;
    box-shadow: 0 0 0 3px rgba(254, 65, 10, 0.12);
  }
  ${premiumTooltip}

  @media (max-width: ${breakpoints.tablet}) {
    min-width: 0;
    width: 100%;
  }
`;

const TableWrap = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TH = styled.th`
  padding: 16px 24px;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
`;

const TR = styled.tr`
  transition: background 0.2s ease;
  
  &:hover {
    background: #f8fafc;
  }
  
  &:last-child td {
    border-bottom: none;
  }
`;

const TD = styled.td`
  padding: 16px 24px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  text-align: center;
`;

const RowTitle = styled.div`
  font-weight: 700;
  color: #0f172a;
  font-size: 14px;
`;

const RowSub = styled.div`
  font-weight: 500;
  color: #64748b;
  font-size: 13px;
  margin-top: 4px;
`;

const StatusPill = styled.span<{ $tone: 'green' | 'amber' | 'slate' | 'blue' }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  ${({ $tone }) => $tone === 'green' && `background: rgba(34,197,94,0.12); color: #15803d;`}
  ${({ $tone }) => $tone === 'amber' && `background: rgba(245,158,11,0.14); color: #b45309;`}
  ${({ $tone }) => $tone === 'slate' && `background: rgba(100,116,139,0.12); color: #475569;`}
  ${({ $tone }) => $tone === 'blue' && `background: rgba(59,130,246,0.12); color: #1d4ed8;`}
`;

const ActionBtn = styled.button<{ $variant?: 'solid' | 'ghost'; $tooltipText?: string }>`
  border-radius: 12px;
  padding: 10px 14px;
  border: 1px solid rgba(254, 65, 10, 0.18);
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
  ${({ $variant }) =>
    $variant === 'ghost'
      ? `
        background: white;
        color: #1a1f22;
      `
      : `
        background: #fe410a;
        color: white;
      `}

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(254, 65, 10, 0.16);
  }

  &:disabled {
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    opacity: 0.55;
  }
  ${premiumTooltip}
`;

const EmptyState = styled.div`
  padding: 36px 24px;
  color: #7a828d;
  text-align: center;
`;


const formatDate = (value?: string | Date) => {
  if (!value) return 'Sin dato';
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const MetricCell = styled.span`
  font-weight: 700;
  color: #1e293b;
  font-size: 14px;
`;

const CompanyRow = ({ company, onImpersonate }: { company: CompanySupportItem; onImpersonate: (company: CompanySupportItem) => void }) => {
  const tone = company.status === 'ACTIVE' ? 'green' : company.status === 'SOFT_BLOCK' ? 'amber' : 'slate';

  return (
    <TR>
      <TD>
        <RowTitle>{company.displayName}</RowTitle>
        <RowSub>{company.email}</RowSub>
      </TD>
      <TD>
        <StatusPill $tone={tone}>{company.status}</StatusPill>
      </TD>
      <TD>
        <MetricCell>{company.activeChallenges}</MetricCell>
      </TD>
      <TD>
        <MetricCell>{company.closedChallenges}</MetricCell>
      </TD>
      <TD>{formatDate(company.updatedAt)}</TD>
      <TD>
        <ActionBtn type="button" onClick={() => onImpersonate(company)} $tooltipText="Abrir sesión espejo en modo lectura">
          Ver como empresa
        </ActionBtn>
      </TD>
    </TR>
  );
};

export const AdminClientsView = () => {
  const navigate = useNavigate();
  const { setImpersonationToken, userProfile, impersonationSession } = useAuth();
  const [companies, setCompanies] = useState<CompanySupportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (impersonationSession || getStoredImpersonationToken()) {
      setLoading(false);
      return;
    }
    const loadCompanies = async () => {
      setLoading(true);
      try {
        const data = await adminService.getCompanies();
        setCompanies(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudieron cargar las empresas.';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    void loadCompanies();
  }, [impersonationSession]);

  const filteredCompanies = useMemo(
    () => companies.filter((company) => {
      const haystack = `${company.displayName} ${company.email}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    }),
    [companies, search],
  );

  const handleImpersonate = async (company: CompanySupportItem) => {
    try {
      const session = await adminService.impersonateCompany(company.id);
      setImpersonationToken(session.token);
      toast.success(`Sesión espejo activada para ${company.displayName}.`);
      navigate('/dashboard/company/stats', { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No fue posible abrir la sesión espejo.';
      toast.error(message);
    }
  };

  return (
    <ViewShell>
      {impersonationSession && (
        <Panel>
          <PanelHeader>
            <TitleBlock>
              <Eyebrow>Sesión activa</Eyebrow>
              <Title>{impersonationSession.company.displayName}</Title>
              <Description>
                Estás navegando en modo lectura como esta empresa. Usa el banner superior para salir cuando termines.
              </Description>
            </TitleBlock>
          </PanelHeader>
          <ReadOnlyBanner>
            <ReadOnlyBadge>Modo lectura</ReadOnlyBadge>
            Estás en modo lectura ahora: las acciones de crear o editar quedan bloqueadas mientras dure esta sesión.
          </ReadOnlyBanner>
        </Panel>
      )}

      <Panel>
        <PanelHeader>
          <TitleBlock>
            <Title>Directorio de Clientes</Title>
            <Description>
              Lista de empresas habilitadas para auditar sus métricas y abrir sesiones espejo de soporte en modo lectura.
            </Description>
          </TitleBlock>
          <SearchInput
            type="search"
            placeholder="Buscar empresa o contacto"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            $tooltipText={impersonationSession ? 'Estás en modo lectura ahora' : 'Buscar empresa o contacto'}
          />
        </PanelHeader>

        <TableWrap>
          <Table>
            <thead>
              <tr>
                <TH>Empresa</TH>
                <TH>Estado</TH>
                <TH>Retos activos</TH>
                <TH>Retos cerrados</TH>
                <TH>Última actividad</TH>
                <TH>Acción</TH>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <TD colSpan={6}>
                    <EmptyState>Cargando empresas...</EmptyState>
                  </TD>
                </tr>
              )}
              {!loading && filteredCompanies.length === 0 && (
                <tr>
                  <TD colSpan={6}>
                    <EmptyState>No se encontraron empresas con ese criterio.</EmptyState>
                  </TD>
                </tr>
              )}
              {!loading && filteredCompanies.map((company) => (
                <CompanyRow key={company.id} company={company} onImpersonate={handleImpersonate} />
              ))}
            </tbody>
          </Table>
        </TableWrap>

        {userProfile?.role === 'admin' && !loading && (
          <EmptyState style={{ textAlign: 'center', padding: '18px 24px 24px' }}>
            Puedes abrir una sesión de soporte y el sistema te trasladará al panel de la empresa manteniendo el bloqueo de escritura.
          </EmptyState>
        )}
      </Panel>
    </ViewShell>
  );
};

export const AdminAccessView = () => (
  <div>
    <h2>Configuración Accesos</h2>
    <p>Gestión a nivel de sistema: Listas blancas de dominios (ej. @univalle.edu), configuración de IPs y permisos globales.</p>
  </div>
);

export const AdminUsersView = () => {
  const { impersonationSession } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [confirmModal, setConfirmModal] = useState<{ userId: string; userName: string; newRole: string } | null>(null);
  const [updating, setUpdating] = useState(false);
  const [reputationUserId, setReputationUserId] = useState<string | null>(null);
  const limit = 15;

  const ROLE_OPTIONS = [
    { value: '', label: 'Todos' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'COMPANY', label: 'Empresa' },
    { value: 'JUDGE', label: 'Juez' },
    { value: 'USER', label: 'Participante' },
  ];

  const ROLE_LABELS: Record<string, string> = {
    ADMIN: 'Admin',
    COMPANY: 'Empresa',
    JUDGE: 'Juez',
    USER: 'Participante',
    admin: 'Admin',
    company: 'Empresa',
    judge: 'Juez',
    student: 'Participante',
    user: 'Participante',
  };

  const ROLE_TONES: Record<string, 'green' | 'amber' | 'slate' | 'blue'> = {
    ADMIN: 'amber',
    COMPANY: 'blue',
    JUDGE: 'slate',
    USER: 'green',
    admin: 'amber',
    company: 'blue',
    judge: 'slate',
    student: 'green',
    user: 'green',
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (impersonationSession || getStoredImpersonationToken()) {
      setLoading(false);
      return;
    }
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const result = await adminService.searchUsers(debouncedSearch, roleFilter, page, limit);
        setUsers(result.users);
        setTotal(result.total);
      } catch (error) {
        toast.error('Error al buscar usuarios.');
      } finally {
        setLoading(false);
      }
    };
    void fetchUsers();
  }, [debouncedSearch, roleFilter, page, impersonationSession]);

  const totalPages = Math.ceil(total / limit);

  const handleRoleChange = (userId: string, userName: string, newRole: string) => {
    setConfirmModal({ userId, userName, newRole });
  };

  const confirmRoleChange = async () => {
    if (!confirmModal) return;
    setUpdating(true);
    try {
      await adminService.updateUserRole(confirmModal.userId, confirmModal.newRole);
      toast.success(`Rol de ${confirmModal.userName} actualizado a ${ROLE_LABELS[confirmModal.newRole] || confirmModal.newRole}.`);
      setUsers(prev => prev.map(u =>
        u.id === confirmModal.userId ? { ...u, role: confirmModal.newRole } : u,
      ));
    } catch (error) {
      toast.error('Error al actualizar el rol.');
    } finally {
      setUpdating(false);
      setConfirmModal(null);
    }
  };

  return (
    <ViewShell>
      {confirmModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
        }}>
          <div style={{
            background: 'white', borderRadius: '24px', padding: '32px 36px', maxWidth: 440,
            boxShadow: '0 24px 80px rgba(0,0,0,0.18)', textAlign: 'center',
            border: '1px solid #e2e8f0',
          }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 900, color: '#1a1f22' }}>
              Confirmar cambio de rol
            </h3>
            <p style={{ margin: '0 0 24px', color: '#5b6470', lineHeight: 1.6 }}>
              Cambiar el rol de <strong>{confirmModal.userName}</strong> a{' '}
              <strong style={{ color: '#fe410a' }}>{ROLE_LABELS[confirmModal.newRole] || confirmModal.newRole}</strong>.
              Esta accion es inmediata.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <ActionBtn type="button" $variant="ghost" onClick={() => setConfirmModal(null)} disabled={updating}>
                Cancelar
              </ActionBtn>
              <ActionBtn type="button" onClick={() => void confirmRoleChange()} disabled={updating}>
                {updating ? 'Guardando...' : 'Confirmar'}
              </ActionBtn>
            </div>
          </div>
        </div>
      )}

      <Panel>
        <PanelHeader>
          <TitleBlock>
            <Title>Control de Usuarios</Title>
            <Description>
              Busca usuarios por nombre o correo y asigna o revoca roles del sistema.
            </Description>
          </TitleBlock>
          <SearchInput
            type="search"
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </PanelHeader>

        <div style={{ padding: '0 24px 16px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ROLE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { setRoleFilter(opt.value); setPage(1); }}
              style={{
                padding: '7px 16px', borderRadius: 999, border: 'none',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                background: roleFilter === opt.value ? '#fe410a' : '#f1f5f9',
                color: roleFilter === opt.value ? 'white' : '#475569',
              }}
            >
              {opt.label}
            </button>
          ))}
          {total > 0 && (
            <span style={{
              marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: '#94a3b8',
              display: 'flex', alignItems: 'center',
            }}>
              {total} usuario{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <TableWrap>
          <Table>
            <thead>
              <tr>
                <TH>USUARIO</TH>
                <TH>ÁREA</TH>
                <TH>ROL ACTUAL</TH>
                <TH>EVALUAR</TH>
                <TH>CAMBIAR ROL</TH>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <TD colSpan={5}>
                    <EmptyState>Buscando usuarios...</EmptyState>
                  </TD>
                </tr>
              )}
              {!loading && users.length === 0 && (
                <tr>
                  <TD colSpan={5}>
                    <EmptyState>
                      {debouncedSearch
                        ? `No se encontraron usuarios que coincidan con "${debouncedSearch}".`
                        : 'No hay usuarios registrados.'}
                    </EmptyState>
                  </TD>
                </tr>
              )}
              {!loading && users.map(user => (
                <TR key={user.id}>
                  <TD style={{ textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 12, overflow: 'hidden',
                        background: '#f1f5f9', flexShrink: 0, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        {user.avatarUrl
                          ? <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span style={{ fontSize: 16, fontWeight: 800, color: '#94a3b8' }}>
                            {user.displayName?.[0]?.toUpperCase() || '?'}
                          </span>
                        }
                      </div>
                      <div>
                        <RowTitle>{user.displayName}</RowTitle>
                        <RowSub>{user.email}</RowSub>
                      </div>
                    </div>
                  </TD>
                  <TD>
                    <span style={{ fontSize: 13, color: '#64748b' }}>
                      {user.studentProfile?.faculty?.name || 'No especificada'}
                    </span>
                  </TD>
                  <TD>
                    <StatusPill $tone={ROLE_TONES[user.role] || 'slate'}>
                      {ROLE_LABELS[user.role] || user.role}
                    </StatusPill>
                  </TD>
                  <TD>
                    {user.role === 'USER' && (
                      <EvalBtn
                        type="button"
                        onClick={(e) => { (e.currentTarget as HTMLElement).blur(); setReputationUserId(user.id); }}
                        $tooltipText="Ver perfil de reputación"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </EvalBtn>
                    )}
                  </TD>
                  <TD>
                    <select
                      value={user.role?.toUpperCase()}
                      onChange={e => handleRoleChange(user.id, user.displayName, e.target.value)}
                      style={{
                        padding: '8px 12px', borderRadius: 10,
                        border: '1.5px solid #e2e8f0', fontSize: 13, fontWeight: 600,
                        color: '#1e293b', background: 'white', cursor: 'pointer',
                        outline: 'none', transition: 'border-color 0.2s',
                      }}
                    >
                      {user.role === 'JUDGE' && <option value="JUDGE">Juez</option>}
                      <option value="ADMIN">Admin</option>
                      <option value="COMPANY">Empresa</option>
                      <option value="USER">Participante</option>
                    </select>
                  </TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </TableWrap>

        {totalPages > 1 && (
          <div style={{
            padding: '16px 24px', display: 'flex', justifyContent: 'center',
            alignItems: 'center', gap: 12, borderTop: '1px solid #f1f5f9',
          }}>
            <ActionBtn
              type="button"
              $variant="ghost"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              style={{ padding: '8px 16px', fontSize: 12 }}
            >
              Anterior
            </ActionBtn>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>
              Pagina {page} de {totalPages}
            </span>
            <ActionBtn
              type="button"
              $variant="ghost"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              style={{ padding: '8px 16px', fontSize: 12 }}
            >
              Siguiente
            </ActionBtn>
          </div>
        )}
      </Panel>

      {reputationUserId && (
        <StudentReputationModal
          userId={reputationUserId}
          onClose={() => setReputationUserId(null)}
          onPromoted={(uid) => {
            setUsers(prev => prev.map(u =>
              u.id === uid ? { ...u, role: 'JUDGE' } : u
            ));
            setReputationUserId(null);
          }}
        />
      )}
    </ViewShell>
  );
};
