import { useEffect, useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services/admin.service';
import { Pista8Theme } from '@/config/theme';
import { premiumTooltip } from '@/features/dashboard/styles/CommonStyles';
import type { AllowedDomain } from '@/types/models';

type DomainRow = {
  id: string;
  value: string;
};

type DomainIssue = {
  rowId: string;
  message: string;
};

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Panel = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const HeaderStrip = styled.section`
  border-radius: 18px;
  padding: 16px 18px;
  background: linear-gradient(180deg, #ffffff 0%, #fcfcfd 100%);
  border: 1px solid rgba(72, 80, 84, 0.08);
  box-shadow: 0 6px 18px rgba(72, 80, 84, 0.05);
  animation: ${fadeUp} 0.3s ease both;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 24px;
  line-height: 1.05;
  color: #1f2628;
  font-weight: 900;
  letter-spacing: -0.03em;
`;

const HeaderNote = styled.p`
  margin: 6px 0 0;
  color: #66727a;
  font-size: 13px;
  line-height: 1.5;
  max-width: 68ch;
`;

const HeaderStats = styled.div`
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const HeaderStat = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba(72, 80, 84, 0.05);
  border: 1px solid rgba(72, 80, 84, 0.08);
  color: #4c565d;
  font-size: 12px;
  font-weight: 700;
`;

const FormCard = styled.section`
  border-radius: 28px;
  background: #ffffff;
  border: 1px solid rgba(72, 80, 84, 0.08);
  box-shadow: 0 10px 30px rgba(72, 80, 84, 0.06);
  overflow: hidden;
`;

const FormHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px 18px;
  border-bottom: 1px solid rgba(72, 80, 84, 0.08);
  flex-wrap: wrap;
`;

const FormTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FormTitleText = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 900;
  color: #1f2628;
`;

const FormHint = styled.p`
  margin: 0;
  color: #66727a;
  font-size: 13px;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;


const FormBody = styled.div`
  padding: 20px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: flex-start;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const InputWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RowAction = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  align-self: end;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #4c565d;
`;

const Input = styled.input`
  width: 100%;
  min-height: 48px;
  border-radius: 14px;
  border: 1.5px solid rgba(72, 80, 84, 0.12);
  padding: 0 14px;
  font-size: 15px;
  font-weight: 700;
  color: #1f2628;
  background: #fff;
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;

  &:focus {
    border-color: #fe410a;
    box-shadow: 0 0 0 3px rgba(254, 65, 10, 0.12);
  }

  &::placeholder {
    color: #a5afb5;
    font-weight: 600;
  }
`;

const ActionWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const IconAction = styled.button<{ $size?: number; $danger?: boolean; $primary?: boolean; $tooltipText?: string; $tooltipPosition?: 'top' | 'bottom'; $tooltipAlign?: 'center' | 'right' }>`
  width: ${({ $size }) => ($size ?? 40)}px;
  height: ${({ $size }) => ($size ?? 40)}px;
  border-radius: 10px;
  border: none;
  background: ${({ $primary, $danger }) => ($primary ? Pista8Theme.primary : $danger ? '#fff2ee' : '#f4f6f7')};
  color: ${({ $primary }) => ($primary ? '#fff' : Pista8Theme.secondary)};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform ${Pista8Theme.transition.normal} ease, background ${Pista8Theme.transition.normal} ease;

  &:hover {
    transform: translateY(-4%);
    background: ${({ $primary }) => ($primary ? Pista8Theme.primary : 'rgba(72, 80, 84, 0.06)')};
  }

  svg { display: block; }
  ${premiumTooltip}
`;

const StatusBadge = styled.span<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 10px;
  border-radius: 999px;
  background: ${({ $active }) => ($active ? 'rgba(254, 65, 10, 0.10)' : 'rgba(72, 80, 84, 0.08)')};
  border: 1px solid ${({ $active }) => ($active ? 'rgba(254, 65, 10, 0.18)' : 'rgba(72, 80, 84, 0.12)')};
  color: ${({ $active }) => ($active ? '#fe410a' : '#5f6870')};
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const BadgeDot = styled.span<{ $active: boolean }>`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${({ $active }) => ($active ? '#fe410a' : '#7f8790')};
  box-shadow: 0 0 0 3px ${({ $active }) => ($active ? 'rgba(254, 65, 10, 0.12)' : 'rgba(127, 135, 144, 0.12)')};
`;

const SwitchAction = styled.button<{ $active: boolean; $tooltipText?: string }>`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(254, 65, 10, 0.18)' : 'rgba(72, 80, 84, 0.12)')};
  background: ${({ $active }) => ($active ? 'rgba(254, 65, 10, 0.08)' : '#f4f6f7')};
  color: ${({ $active }) => ($active ? '#fe410a' : '#5f6870')};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform ${Pista8Theme.transition.normal} ease, background ${Pista8Theme.transition.normal} ease;

  &:hover {
    transform: translateY(-1px);
    background: ${({ $active }) => ($active ? 'rgba(254, 65, 10, 0.12)' : 'rgba(72, 80, 84, 0.08)')};
  }

  svg {
    display: block;
  }
  ${premiumTooltip}
`;

const IssuesBox = styled.div`
  border-radius: 18px;
  background: #fff5ef;
  border: 1px solid rgba(217, 76, 29, 0.14);
  padding: 14px 16px;
  color: #a93f17;
  font-size: 13px;
  line-height: 1.6;
`;

const ListCard = styled.section`
  border-radius: 28px;
  background: white;
  border: 1px solid rgba(72, 80, 84, 0.08);
  box-shadow: 0 10px 30px rgba(72, 80, 84, 0.06);
  overflow: hidden;
`;

const ListHeader = styled.div`
  padding: 22px 24px 18px;
  border-bottom: 1px solid rgba(72, 80, 84, 0.08);
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const DomainList = styled.div`
  padding: 12px;
  display: grid;
  gap: 10px;
`;

const DomainItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 16px 16px 16px 18px;
  border-radius: 18px;
  background: linear-gradient(180deg, #fff 0%, #fbfbfc 100%);
  border: 1px solid rgba(72, 80, 84, 0.08);
`;

const DomainText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const DomainTop = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const DomainName = styled.div`
  font-size: 15px;
  font-weight: 900;
  color: #1f2628;
  word-break: break-word;
`;

const DomainMeta = styled.div`
  font-size: 12px;
  color: #76828a;
`;

const EmptyState = styled.div`
  padding: 34px 24px 40px;
  text-align: center;
  color: #76828a;
`;

const DOMAIN_REGEX = /^(?!-)[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i;

const createRow = (): DomainRow => ({
  id: crypto.randomUUID(),
  value: '',
});

const normalizeDomain = (value: string) => {
  const cleaned = value.trim().toLowerCase();

  if (!cleaned) {
    return '';
  }

  const withoutPrefix = cleaned.startsWith('@') ? cleaned.slice(1) : cleaned;
  const lastAt = withoutPrefix.lastIndexOf('@');
  return lastAt >= 0 ? withoutPrefix.slice(lastAt + 1).trim() : withoutPrefix;
};

export default function WhitelistManager() {
  const [domains, setDomains] = useState<AllowedDomain[]>([]);
  const [rows, setRows] = useState<DomainRow[]>([createRow()]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [issues, setIssues] = useState<DomainIssue[]>([]);

  useEffect(() => {
    loadDomains();
  }, []);

  const domainCount = useMemo(() => domains.length, [domains]);
  const activeDomainCount = useMemo(() => domains.filter((domain) => domain.isActive).length, [domains]);
  const inactiveDomainCount = useMemo(() => domains.filter((domain) => !domain.isActive).length, [domains]);
  const draftCount = useMemo(
    () => rows.filter((row) => normalizeDomain(row.value).length > 0).length,
    [rows],
  );

  async function loadDomains() {
    setLoading(true);
    try {
      const list = await adminService.getWhitelist();
      setDomains(list || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function updateRow(id: string, value: string) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, value } : row)),
    );
  }

  function addRow() {
    setRows((current) => [...current, createRow()]);
  }

  function removeRow(id: string) {
    setRows((current) => (current.length === 1 ? [createRow()] : current.filter((row) => row.id !== id)));
    setIssues((current) => current.filter((issue) => issue.rowId !== id));
  }

  async function saveRows() {
    const normalized = rows
      .map((row) => ({
        rowId: row.id,
        value: normalizeDomain(row.value),
      }))
      .filter((row) => row.value.length > 0);

    const nextIssues: DomainIssue[] = [];
    const uniqueDomains = new Set<string>();
    const acceptedDomains: string[] = [];

    for (const row of normalized) {
      if (!DOMAIN_REGEX.test(row.value)) {
        nextIssues.push({ rowId: row.rowId, message: 'Ingresa un dominio válido, por ejemplo univalle.edu o est.univalle.edu.' });
        continue;
      }

      if (uniqueDomains.has(row.value)) {
        nextIssues.push({ rowId: row.rowId, message: 'Ese dominio ya está repetido en el formulario.' });
        continue;
      }

      uniqueDomains.add(row.value);
      acceptedDomains.push(row.value);
    }

    setIssues(nextIssues);
    if (!acceptedDomains.length) {
      return;
    }

    setSaving(true);
    try {
      const created: AllowedDomain[] = [];
      const currentDomains = new Set(domains.map((item) => item.domain));

      for (const domain of acceptedDomains) {
        if (currentDomains.has(domain)) {
          continue;
        }

        const saved = await adminService.addDomain(domain);
        created.push(saved);
        currentDomains.add(saved.domain);
      }

      if (created.length > 0) {
        setDomains((current) => [...current, ...created].sort((a, b) => a.domain.localeCompare(b.domain)));
      }

      setRows([createRow()]);
    } catch (error) {
      console.error(error);
      setIssues((current) => current.length > 0 ? current : [{ rowId: rows[0]?.id ?? 'global', message: 'No se pudo guardar uno de los dominios. Revisa si ya existe o si el formato es inválido.' }]);
    } finally {
      setSaving(false);
    }
  }

  async function toggleDomainStatus(domain: AllowedDomain) {
    const nextActive = !domain.isActive;

    try {
      const updated = await adminService.setDomainStatus(domain.id, nextActive);
      setDomains((current) =>
        current
          .map((item) => (item.id === updated.id ? updated : item))
          .sort((a, b) => a.domain.localeCompare(b.domain)),
      );

      if (updated.isActive) {
        toast.success('Dominio habilitado', {
          description: `Los estudiantes con correo ${updated.domain} ya pueden registrarse automáticamente en la plataforma.`,
          duration: 4000,
        });
      } else {
        toast.warning('Nuevos registros bloqueados', {
          description: `Se ha pausado el ingreso para ${updated.domain}. Los usuarios que ya tenían cuenta podrán seguir ingresando sin problemas.`,
          duration: 4500,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error('No se pudo cambiar el estado del dominio.');
    }
  }

  return (
    <Panel>
      <HeaderStrip>
        <Title>Dominios autorizados</Title>
        <HeaderNote>
          Validación por coincidencia exacta para controlar el registro de usuarios.
        </HeaderNote>
        <HeaderStats>
          <HeaderStat>{activeDomainCount} activos</HeaderStat>
          <HeaderStat>{inactiveDomainCount} inactivos</HeaderStat>
          <HeaderStat>{draftCount} listos para guardar</HeaderStat>
        </HeaderStats>
      </HeaderStrip>

      <FormCard>
        <FormHeader>
          <FormTitle>
            <FormTitleText>Editor de whitelist</FormTitleText>
            <FormHint>
              {domainCount} dominio{domainCount === 1 ? '' : 's'} cargado{domainCount === 1 ? '' : 's'} · toca el switch para activar o pausar registros
            </FormHint>
          </FormTitle>

          <Actions>
            <ActionWrapper>
              <IconAction aria-label="Agregar fila" $tooltipText="Agregar fila" $tooltipPosition="bottom" type="button" onClick={addRow}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={Pista8Theme.secondary} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              </IconAction>
            </ActionWrapper>

            <ActionWrapper>
              <IconAction aria-label="Guardar dominios" $tooltipText={saving ? 'Guardando dominios…' : 'Guardar dominios'} $tooltipPosition="bottom" $tooltipAlign="right" type="button" onClick={saveRows} $primary>
                {saving ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 01-2-2V7a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2z" />
                    <path d="M17 21v-8H7v8" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 01-2-2V7a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2z" />
                    <path d="M17 21v-8H7v8" />
                  </svg>
                )}
              </IconAction>
            </ActionWrapper>
          </Actions>
        </FormHeader>

        <FormBody>
          {rows.map((row, index) => {
            const issue = issues.find((entry) => entry.rowId === row.id);

            return (
              <div key={row.id}>
                <Row>
                  <InputWrap>
                    <Label htmlFor={`domain-${row.id}`}>Dominio {index + 1}</Label>
                    <Input
                      id={`domain-${row.id}`}
                      value={row.value}
                      onChange={(event) => updateRow(row.id, event.target.value)}
                      placeholder="univalle.edu"
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </InputWrap>

                  <RowAction>
                    <IconAction aria-label={`Eliminar fila ${index + 1}`} $tooltipText="Quitar fila" type="button" onClick={() => removeRow(row.id)} $danger>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={Pista8Theme.secondary} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
                    </IconAction>
                  </RowAction>
                </Row>

                {issue && <IssuesBox>{issue.message}</IssuesBox>}
              </div>
            );
          })}
        </FormBody>
      </FormCard>

      <ListCard>
        <ListHeader>
          <div>
            <FormTitleText>Lista activa</FormTitleText>
            <FormHint>
              {loading ? 'Cargando dominios...' : `${domains.length} registro${domains.length === 1 ? '' : 's'} autorizado${domains.length === 1 ? '' : 's'}`}
            </FormHint>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <IconAction aria-label="Refrescar lista" $tooltipText="Recargar" $tooltipPosition="bottom" type="button" onClick={loadDomains}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={Pista8Theme.secondary} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 4v6h-6" />
                <path d="M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10" />
                <path d="M20.49 15a9 9 0 01-14.85 3.36L1 14" />
              </svg>
            </IconAction>
          </div>
        </ListHeader>

        {loading ? (
          <EmptyState>Cargando la lista actual...</EmptyState>
        ) : domains.length === 0 ? (
          <EmptyState>No hay dominios configurados todavía.</EmptyState>
        ) : (
          <DomainList>
            {domains.map((domain) => (
              <DomainItem key={domain.id}>
                <DomainText>
                  <DomainTop>
                    <DomainName>{domain.domain}</DomainName>
                    <StatusBadge $active={domain.isActive}>
                      <BadgeDot $active={domain.isActive} />
                      {domain.isActive ? 'Activo' : 'Inactivo'}
                    </StatusBadge>
                  </DomainTop>
                  <DomainMeta>
                    {domain.isActive
                      ? 'Los estudiantes con este correo pueden registrarse automáticamente.'
                      : 'El registro nuevo está pausado, pero los usuarios existentes siguen entrando normal.'}
                  </DomainMeta>
                </DomainText>

                <div style={{ display: 'flex', gap: 8 }}>
                  <SwitchAction
                    type="button"
                    $active={domain.isActive}
                    aria-label={domain.isActive ? `Pausar ${domain.domain}` : `Activar ${domain.domain}`}
                    $tooltipText={domain.isActive ? 'Pausar' : 'Activar'}
                    onClick={() => toggleDomainStatus(domain)}
                  >
                    {domain.isActive ? (
                      <ToggleRight size={22} strokeWidth={2.4} />
                    ) : (
                      <ToggleLeft size={22} strokeWidth={2.4} />
                    )}
                  </SwitchAction>
                </div>
              </DomainItem>
            ))}
          </DomainList>
        )}
      </ListCard>
    </Panel>
  );
}