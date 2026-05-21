import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'sonner';
import { useAuth } from '../../../../context/AuthContext';
import { adminService } from '../../../../services/admin.service';
import type { CompanySupportItem } from '../../../../types/models';
import { premiumTooltip } from '../../styles/CommonStyles';

export { AdminStatsView } from './AdminStatsView';

const ViewShell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
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
  border-bottom: 1px solid rgba(72, 80, 84, 0.06);
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
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

const StatusPill = styled.span<{ $tone: 'green' | 'amber' | 'slate' }>`
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

const SupportGrid = styled.div`
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const SupportCard = styled.div`
  padding: 20px;
  border-radius: 20px;
  border: 1px solid rgba(72, 80, 84, 0.08);
  background: linear-gradient(180deg, rgba(254, 65, 10, 0.04), white);
`;

const SupportCardTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 900;
  color: #1a1f22;
`;

const SupportCardText = styled.p`
  margin: 0;
  color: #5b6470;
  line-height: 1.6;
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
  }, []);

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

export const AdminUsersView = () => (
  <div>
    <h2>Control Usuarios</h2>
    <p>Gestión de personas: Buscador de usuarios para asignar o revocar roles específicos (Admin, Juez, Company).</p>
  </div>
);

export const AdminSupportView = () => {
  const { impersonationSession, clearImpersonationSession } = useAuth();

  return (
    <ViewShell>
      <Panel>
        <PanelHeader>
          <TitleBlock>
            <Eyebrow>Soporte</Eyebrow>
            <Title>Modo espejo y supervisión</Title>
            <Description>
              Desde aquí puedes revisar la empresa actualmente abierta en modo lectura y cerrar la sesión espejo cuando termines.
            </Description>
          </TitleBlock>
        </PanelHeader>

        <div style={{ padding: '0 24px 24px' }}>
          <SupportGrid>
            <SupportCard>
              <SupportCardTitle>Sesión actual</SupportCardTitle>
              <SupportCardText>
                {impersonationSession
                  ? `Activa sobre ${impersonationSession.company.displayName}. Solo lectura y sin mutaciones permitidas.`
                  : 'No hay una sesión espejo activa en este momento.'}
              </SupportCardText>
            </SupportCard>

            <SupportCard>
              <SupportCardTitle>Salida segura</SupportCardTitle>
              <SupportCardText>
                {impersonationSession
                  ? `La sesión expira el ${formatDate(impersonationSession.expiresAt)}. Puedes cerrarla antes con un clic.`
                  : 'No hace falta cerrar nada; cuando actives una sesión, aparecerá aquí el control de salida.'}
              </SupportCardText>
              {impersonationSession && (
                <div style={{ marginTop: 16 }}>
                  <ActionBtn type="button" $variant="ghost" onClick={() => void clearImpersonationSession()}>
                    Salir del modo espejo
                  </ActionBtn>
                </div>
              )}
            </SupportCard>
          </SupportGrid>
        </div>
      </Panel>
    </ViewShell>
  );
};
