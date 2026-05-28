import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';
import { Pencil, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services/admin.service';
import { getStoredImpersonationToken } from '@/utils/impersonation-session';
import { Pista8Theme } from '@/config/theme';
import { premiumTooltip } from '@/features/dashboard/styles/CommonStyles';
import type { FacultyCatalogItem } from '@/types/models';

type FacultyRow = { id: string; value: string };
type FacultyIssue = { rowId: string; message: string };

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Panel = styled.div`width: 100%; display: flex; flex-direction: column; gap: 18px;`;
const HeaderStrip = styled.section`
  border-radius: 18px; padding: 16px 18px;
  background: linear-gradient(180deg, #ffffff 0%, #fcfcfd 100%);
  border: 1px solid rgba(72, 80, 84, 0.08);
  box-shadow: 0 6px 18px rgba(72, 80, 84, 0.05);
  animation: ${fadeUp} 0.3s ease both;
`;
const Title = styled.h2`margin: 0; font-size: 24px; font-weight: 900; color: #1f2628;`;
const HeaderNote = styled.p`margin: 6px 0 0; color: #66727a; font-size: 13px; line-height: 1.5;`;
const HeaderStats = styled.div`margin-top: 10px; display: flex; flex-wrap: wrap; gap: 8px;`;
const HeaderStat = styled.span`
  padding: 7px 10px; border-radius: 999px; background: rgba(72, 80, 84, 0.05);
  border: 1px solid rgba(72, 80, 84, 0.08); color: #4c565d; font-size: 12px; font-weight: 700;
`;
const FormCard = styled.section`
  border-radius: 28px; background: #fff; border: 1px solid rgba(72, 80, 84, 0.08);
  box-shadow: 0 10px 30px rgba(72, 80, 84, 0.06); overflow: hidden;
`;
const FormHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 22px 24px 18px; border-bottom: 1px solid rgba(72, 80, 84, 0.08); flex-wrap: wrap;
`;
const FormTitleText = styled.h3`margin: 0; font-size: 18px; font-weight: 900; color: #1f2628;`;
const FormHint = styled.p`margin: 0; color: #66727a; font-size: 13px;`;
const FormBody = styled.div`padding: 20px 24px 24px; display: flex; flex-direction: column; gap: 14px;`;
const Row = styled.div`
  display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; align-items: flex-start;
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;
const InputWrap = styled.div`display: flex; flex-direction: column; gap: 8px;`;
const RowAction = styled.div`display: flex; align-items: center; gap: 8px; align-self: end;`;
const Label = styled.label`
  font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; color: #4c565d;
`;
const Input = styled.input`
  width: 100%; min-height: 48px; border-radius: 14px; border: 1.5px solid rgba(72, 80, 84, 0.12);
  padding: 0 14px; font-size: 15px; font-weight: 700; color: #1f2628; outline: none;
  &:focus { border-color: #fe410a; box-shadow: 0 0 0 3px rgba(254, 65, 10, 0.12); }
`;
const IconAction = styled.button<{ $danger?: boolean; $primary?: boolean; $tooltipText?: string; $tooltipPosition?: 'top' | 'bottom'; $tooltipAlign?: 'center' | 'right' }>`
  width: 40px; height: 40px; border-radius: 10px; border: none; cursor: pointer;
  background: ${({ $primary, $danger }) => ($primary ? Pista8Theme.primary : $danger ? '#fff2ee' : '#f4f6f7')};
  color: ${({ $primary }) => ($primary ? '#fff' : Pista8Theme.secondary)};
  display: inline-flex; align-items: center; justify-content: center;
  ${premiumTooltip}
`;
const ListCard = styled.section`
  border-radius: 28px; background: white; border: 1px solid rgba(72, 80, 84, 0.08);
  box-shadow: 0 10px 30px rgba(72, 80, 84, 0.06); overflow: hidden;
`;
const ListHeader = styled.div`
  padding: 22px 24px 18px; border-bottom: 1px solid rgba(72, 80, 84, 0.08);
  display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap;
`;
const DomainList = styled.div`padding: 12px; display: grid; gap: 10px;`;
const DomainItem = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: 14px;
  padding: 16px 18px; border-radius: 18px; background: linear-gradient(180deg, #fff 0%, #fbfbfc 100%);
  border: 1px solid rgba(72, 80, 84, 0.08);
`;
const DomainName = styled.div`font-size: 15px; font-weight: 900; color: #1f2628; word-break: break-word;`;
const StatusBadge = styled.span<{ $active: boolean }>`
  display: inline-flex; align-items: center; gap: 7px; padding: 7px 10px; border-radius: 999px;
  background: ${({ $active }) => ($active ? 'rgba(254, 65, 10, 0.10)' : 'rgba(72, 80, 84, 0.08)')};
  color: ${({ $active }) => ($active ? '#fe410a' : '#5f6870')};
  font-size: 11px; font-weight: 900; text-transform: uppercase;
`;
const BadgeDot = styled.span<{ $active: boolean }>`
  width: 7px; height: 7px; border-radius: 50%;
  background: ${({ $active }) => ($active ? '#fe410a' : '#7f8790')};
`;
const SwitchAction = styled.button<{ $active: boolean; $tooltipText?: string }>`
  width: 44px; height: 44px; border-radius: 12px; border: 1px solid ${({ $active }) => ($active ? 'rgba(254, 65, 10, 0.18)' : 'rgba(72, 80, 84, 0.12)')};
  background: ${({ $active }) => ($active ? 'rgba(254, 65, 10, 0.08)' : '#f4f6f7')};
  color: ${({ $active }) => ($active ? '#fe410a' : '#5f6870')};
  display: inline-flex; align-items: center; justify-content: center; cursor: pointer;
  ${premiumTooltip}
`;
const IssuesBox = styled.div`
  border-radius: 18px; background: #fff5ef; border: 1px solid rgba(217, 76, 29, 0.14);
  padding: 14px 16px; color: #a93f17; font-size: 13px;
`;
const EmptyState = styled.div`padding: 34px 24px 40px; text-align: center; color: #76828a;`;
const ModalBackdrop = styled.div`position: fixed; inset: 0; background: rgba(31, 38, 40, 0.45); z-index: 1200;`;
const ModalShell = styled.div`
  position: fixed; inset: 0; z-index: 1201; display: flex; align-items: center; justify-content: center; padding: 20px;
`;
const ModalCard = styled.div`
  position: relative; z-index: 1202;
  width: min(480px, 100%); border-radius: 22px; background: #fff;
  box-shadow: 0 24px 60px rgba(31, 38, 40, 0.18); animation: ${fadeUp} 0.22s ease both;
`;
const ModalHeader = styled.div`
  display: flex; justify-content: space-between; gap: 12px; padding: 20px 22px 14px;
  border-bottom: 1px solid rgba(72, 80, 84, 0.08);
`;
const ModalBody = styled.div`padding: 18px 22px 22px; display: flex; flex-direction: column; gap: 14px;`;
const ModalActions = styled.div`display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap;`;
const TextButton = styled.button`
  min-height: 42px; padding: 0 16px; border-radius: 12px; border: 1px solid rgba(72, 80, 84, 0.14);
  background: #fff; font-weight: 800; cursor: pointer;
`;
const PrimaryButton = styled.button`
  min-height: 42px; padding: 0 18px; border-radius: 12px; border: none; background: ${Pista8Theme.primary};
  color: #fff; font-weight: 800; cursor: pointer; &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const normalizeName = (value: string) => value.trim().replace(/\s+/g, ' ');
const createRow = (): FacultyRow => ({ id: crypto.randomUUID(), value: '' });

export default function FacultiesManager() {
  const [faculties, setFaculties] = useState<FacultyCatalogItem[]>([]);
  const [rows, setRows] = useState<FacultyRow[]>([createRow()]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [issues, setIssues] = useState<FacultyIssue[]>([]);
  const [editingFaculty, setEditingFaculty] = useState<FacultyCatalogItem | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => { void loadFaculties(); }, []);

  const activeCount = useMemo(() => faculties.filter((f) => f.isActive).length, [faculties]);
  const inactiveCount = useMemo(() => faculties.filter((f) => !f.isActive).length, [faculties]);

  async function loadFaculties() {
    if (getStoredImpersonationToken()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const list = await adminService.getFaculties();
      setFaculties(Array.isArray(list) ? list : []);
    } catch (error: unknown) {
      console.error(error);
      setFaculties([]);
      const err = error as { response?: { status?: number; data?: { message?: string | string[] } } };
      const status = err.response?.status;
      const backendMessage = err.response?.data?.message;

      if (status === 403) {
        setLoadError(
          'Tu cuenta no tiene rol de administrador en el backend. Inicia sesión con una cuenta ADMIN.',
        );
      } else if (status === 404) {
        setLoadError(
          'El servidor no reconoce la gestión de facultades. Reconstruye el backend: pnpm run build && pnpm run start:dev (o docker compose up --build).',
        );
      } else {
        setLoadError('No se pudo cargar el catálogo de facultades.');
      }

      toast.error(
        Array.isArray(backendMessage)
          ? backendMessage[0]
          : backendMessage || 'Error al cargar facultades',
      );
    } finally {
      setLoading(false);
    }
  }

  function updateRow(id: string, value: string) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, value } : row)));
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
      .map((row) => ({ rowId: row.id, value: normalizeName(row.value) }))
      .filter((row) => row.value.length > 0);

    const nextIssues: FacultyIssue[] = [];
    const seen = new Set<string>();
    const accepted: string[] = [];

    for (const row of normalized) {
      if (row.value.length < 2) {
        nextIssues.push({ rowId: row.rowId, message: 'El nombre debe tener al menos 2 caracteres.' });
        continue;
      }
      const key = row.value.toLowerCase();
      if (seen.has(key)) {
        nextIssues.push({ rowId: row.rowId, message: 'Esa facultad ya está repetida en el formulario.' });
        continue;
      }
      seen.add(key);
      accepted.push(row.value);
    }

    setIssues(nextIssues);
    if (!accepted.length) return;

    setSaving(true);
    try {
      const created: FacultyCatalogItem[] = [];
      const existing = new Set(faculties.map((f) => f.name.toLowerCase()));

      for (const name of accepted) {
        if (existing.has(name.toLowerCase())) continue;
        const saved = await adminService.addFaculty(name);
        created.push(saved);
        existing.add(saved.name.toLowerCase());
      }

      if (created.length > 0) {
        setFaculties((current) =>
          [...current, ...created].sort((a, b) => a.name.localeCompare(b.name)),
        );
        toast.success(`${created.length} facultad(es) agregada(s).`);
      }

      setRows([createRow()]);
    } catch (error) {
      console.error(error);
      setIssues((current) =>
        current.length > 0
          ? current
          : [{ rowId: rows[0]?.id ?? 'global', message: 'No se pudo guardar la facultad. Revisa si ya existe.' }],
      );
    } finally {
      setSaving(false);
    }
  }

  function openEditModal(faculty: FacultyCatalogItem) {
    setEditingFaculty(faculty);
    setEditValue(faculty.name);
    setEditError(null);
  }

  function closeEditModal() {
    setEditingFaculty(null);
    setEditValue('');
    setEditError(null);
    setEditSaving(false);
  }

  async function saveFacultyEdit() {
    if (!editingFaculty) return;
    const name = normalizeName(editValue);
    if (name.length < 2) {
      setEditError('El nombre debe tener al menos 2 caracteres.');
      return;
    }
    if (name === editingFaculty.name) {
      closeEditModal();
      return;
    }

    setEditSaving(true);
    setEditError(null);
    try {
      const updated = await adminService.updateFaculty(editingFaculty.id, name);
      setFaculties((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)).sort((a, b) => a.name.localeCompare(b.name)),
      );
      toast.success('Facultad actualizada', {
        description: 'El cambio se reflejará en los selectores y filtros de la plataforma.',
      });
      closeEditModal();
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { message?: string | string[] } } };
      const message =
        err.response?.data?.message ||
        (err.response?.status === 409 ? 'Esa facultad ya está registrada.' : 'No se pudo actualizar la facultad.');
      setEditError(Array.isArray(message) ? message[0] : message);
    } finally {
      setEditSaving(false);
    }
  }

  async function toggleFacultyStatus(faculty: FacultyCatalogItem) {
    try {
      const updated = await adminService.setFacultyStatus(faculty.id, !faculty.isActive);
      setFaculties((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)).sort((a, b) => a.name.localeCompare(b.name)),
      );
      if (updated.isActive) {
        toast.success('Facultad habilitada', { description: `${updated.name} ya aparece en los formularios de registro.` });
      } else {
        toast.warning('Facultad pausada', {
          description: `${updated.name} ya no aparece para nuevos registros. Los perfiles existentes se mantienen.`,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error('No se pudo cambiar el estado de la facultad.');
    }
  }



  return (
    <Panel>
      <HeaderStrip>
        <Title>Catálogo de facultades</Title>
        <HeaderNote>
          Tabla paramétrica para los menús desplegables. Los cambios de nombre se propagan por relación de ID en perfiles y retos.
        </HeaderNote>
        {loadError && <IssuesBox style={{ marginTop: 12 }}>{loadError}</IssuesBox>}
        <HeaderStats>
          <HeaderStat>{activeCount} activas</HeaderStat>
          <HeaderStat>{inactiveCount} inactivas</HeaderStat>
          <HeaderStat>{faculties.length} en catálogo</HeaderStat>
        </HeaderStats>
      </HeaderStrip>

      <FormCard>
        <FormHeader>
          <div>
            <FormTitleText>Agregar facultades</FormTitleText>
            <FormHint>Escribe el nombre y guarda para añadirlo al catálogo.</FormHint>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <IconAction type="button" $tooltipText="Agregar fila" $tooltipPosition="bottom" onClick={addRow}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={Pista8Theme.secondary} strokeWidth="2.6">
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
            </IconAction>
            <IconAction
              type="button"
              $primary
              aria-label="Guardar facultades"
              $tooltipText={saving ? 'Guardando facultades…' : 'Guardar facultades'}
              $tooltipPosition="bottom"
              $tooltipAlign="right"
              onClick={() => void saveRows()}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 01-2-2V7a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2z" />
                <path d="M17 21v-8H7v8" />
              </svg>
            </IconAction>
          </div>
        </FormHeader>
        <FormBody>
          {rows.map((row, index) => {
            const issue = issues.find((entry) => entry.rowId === row.id);
            return (
              <div key={row.id}>
                <Row>
                  <InputWrap>
                    <Label htmlFor={`faculty-${row.id}`}>Facultad {index + 1}</Label>
                    <Input
                      id={`faculty-${row.id}`}
                      value={row.value}
                      onChange={(e) => updateRow(row.id, e.target.value)}
                      placeholder="Ciencias Económicas y Empresariales"
                    />
                  </InputWrap>
                  <RowAction>
                    <IconAction type="button" $danger $tooltipText="Quitar fila" onClick={() => removeRow(row.id)}>
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
          {saving && <FormHint>Guardando facultades…</FormHint>}
        </FormBody>
      </FormCard>

      <ListCard>
        <ListHeader>
          <div>
            <FormTitleText>Lista del catálogo</FormTitleText>
            <FormHint>{loading ? 'Cargando…' : `${faculties.length} facultad(es) registrada(s)`}</FormHint>
          </div>
          <IconAction type="button" $tooltipText="Recargar" $tooltipPosition="bottom" onClick={() => void loadFaculties()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={Pista8Theme.secondary} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10" />
              <path d="M20.49 15a9 9 0 01-14.85 3.36L1 14" />
            </svg>
          </IconAction>
        </ListHeader>

        {loading ? (
          <EmptyState>Cargando facultades…</EmptyState>
        ) : faculties.length === 0 ? (
          <EmptyState>No hay facultades configuradas todavía.</EmptyState>
        ) : (
          <DomainList>
            {faculties.map((faculty) => (
              <DomainItem key={faculty.id}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <DomainName>{faculty.name}</DomainName>
                    <StatusBadge $active={faculty.isActive}>
                      <BadgeDot $active={faculty.isActive} />
                      {faculty.isActive ? 'Activa' : 'Inactiva'}
                    </StatusBadge>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <IconAction type="button" $tooltipText="Editar" onClick={() => openEditModal(faculty)}>
                    <Pencil size={18} strokeWidth={2.4} />
                  </IconAction>

                  <SwitchAction
                    type="button"
                    $active={faculty.isActive}
                    $tooltipText={faculty.isActive ? 'Pausar' : 'Activar'}
                    onClick={() => void toggleFacultyStatus(faculty)}
                  >
                    {faculty.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </SwitchAction>
                </div>
              </DomainItem>
            ))}
          </DomainList>
        )}
      </ListCard>

      {editingFaculty &&
        createPortal(
          <ModalShell role="presentation" onClick={closeEditModal}>
            <ModalBackdrop />
            <ModalCard role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <FormTitleText>Editar facultad</FormTitleText>
                <IconAction type="button" onClick={closeEditModal}><X size={18} /></IconAction>
              </ModalHeader>
              <ModalBody>
                <InputWrap>
                  <Label htmlFor="edit-faculty-input">Nombre</Label>
                  <Input
                    id="edit-faculty-input"
                    value={editValue}
                    onChange={(e) => { setEditValue(e.target.value); setEditError(null); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void saveFacultyEdit(); } }}
                  />
                </InputWrap>
                {editError && <IssuesBox>{editError}</IssuesBox>}
                <ModalActions>
                  <TextButton type="button" onClick={closeEditModal} disabled={editSaving}>Cancelar</TextButton>
                  <PrimaryButton type="button" onClick={() => void saveFacultyEdit()} disabled={editSaving}>
                    {editSaving ? 'Guardando…' : 'Guardar cambios'}
                  </PrimaryButton>
                </ModalActions>
              </ModalBody>
            </ModalCard>
          </ModalShell>,
          document.body,
        )}
    </Panel>
  );
}
