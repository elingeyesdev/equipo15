import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth.service';
import { Pista8Theme } from '../../config/theme';
import LogoutButton from '../dashboard/LogoutButton';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Root = styled.div`
  min-height: 100vh;
  display: flex;
  background: ${Pista8Theme.background};
`;

const Sidebar = styled.aside`
  width: 280px;
  flex-shrink: 0;
  background: ${Pista8Theme.secondary};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px 24px 32px;
  position: sticky;
  top: 0;
  height: 100vh;
`;

const SidebarBrand = styled.div`
  margin-bottom: 48px;
  display: flex;
  justify-content: center;
`;

const UserProfileBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
  text-align: center;
`;

const RoleTag = styled.span`
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: white;
  background: ${Pista8Theme.primary};
  padding: 4px 12px;
  border-radius: 6px;
  margin-bottom: 8px;
`;

const UserName = styled.p`
  font-size: 16px;
  color: white;
  margin: 0;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

const SidebarNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
`;

const NavBtn = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  text-align: left;
  padding: 14px 18px;
  border-radius: 14px;
  border: none;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  background: ${p => p.active ? 'rgba(254,65,10,0.18)' : 'transparent'};
  color: ${p => p.active ? '#FE410A' : 'rgba(255,255,255,0.45)'};
  letter-spacing: 0.01em;
  &:hover { background: rgba(255,255,255,0.07); color: white; }
`;

const SidebarFooter = styled.div`
  border-top: 1px solid rgba(255,255,255,0.08);
  padding-top: 24px;
  display: flex;
  justify-content: center;
`;

const Main = styled.main`
  flex: 1;
  padding: 2.5rem 3%;
  max-width: 960px;
  margin: 0 auto;
`;

const PageHeader = styled.header`
  margin-bottom: 2.5rem;
  animation: ${fadeUp} 0.4s ease both;
`;

const PageTitle = styled.h1`
  font-size: 38px;
  font-weight: 900;
  color: ${Pista8Theme.secondary};
  margin: 0;
  letter-spacing: -0.5px;
`;

const Canvas = styled.section`
  animation: ${fadeUp} 0.4s 0.06s ease both;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 340px;
  background: white;
  border-radius: 24px;
  border: 1.5px dashed rgba(72,80,84,0.15);
  gap: 20px;
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: ${Pista8Theme.primary}10;
  border: 1.5px solid ${Pista8Theme.primary}20;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EmptyLabel = styled.p`
  font-size: 14px;
  color: #a8b0b8;
  font-weight: 500;
  margin: 0;
  text-align: center;
`;

const PrimaryBtn = styled.button`
  padding: 0 24px;
  height: 48px;
  background: ${Pista8Theme.primary};
  color: white;
  border: 1.5px solid ${Pista8Theme.primary};
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 0.01em;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover { background: transparent; color: ${Pista8Theme.primary}; box-shadow: 0 4px 12px ${Pista8Theme.primary}20; }
  &:active { transform: scale(0.98); }
  &:disabled { background: rgba(72,80,84,0.1); border-color: transparent; color: #b8c0c8; cursor: default; transform: none; }
`;

const Builder = styled.div`
  background: white;
  border-radius: 24px;
  border: 1px solid rgba(72,80,84,0.08);
  overflow: hidden;
  box-shadow: 0 4px 32px rgba(72,80,84,0.07);
`;

const BuilderNav = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(72,80,84,0.08);
  padding: 0 32px;
`;

const TabBtn = styled.button<{ active?: boolean }>`
  padding: 18px 0;
  margin-right: 28px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  color: ${p => p.active ? Pista8Theme.primary : '#a8b0b8'};
  border-bottom: 2px solid ${p => p.active ? Pista8Theme.primary : 'transparent'};
  transition: color 0.18s, border-color 0.18s;
  letter-spacing: 0.02em;
  &:hover { color: ${Pista8Theme.secondary}; }
`;

const BuilderBody = styled.div`
  padding: 36px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  width: 100%;
  max-width: 650px;
`;

const FieldLabel = styled.label`
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${Pista8Theme.secondary};
  opacity: 0.8;
  margin-bottom: 4px;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 1.5px solid rgba(72,80,84,0.12);
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: ${Pista8Theme.secondary};
  background: white;
  outline: none;
  transition: all 0.2s;
  height: 48px;
  box-sizing: border-box;
  &::placeholder { color: #c8d0d8; font-weight: 500; }
  &:focus { border-color: ${Pista8Theme.primary}; box-shadow: 0 0 0 3px ${Pista8Theme.primary}15; }
  &[readonly] { background: rgba(72,80,84,0.04); color: #a8b0b8; cursor: default; }
`;

const Textarea = styled.textarea`
  padding: 12px 16px;
  border: 1.5px solid rgba(72,80,84,0.12);
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  color: ${Pista8Theme.secondary};
  background: white;
  outline: none;
  resize: vertical;
  font-family: inherit;
  line-height: 1.6;
  transition: all 0.2s;
  box-sizing: border-box;
  &::placeholder { color: #c8d0d8; font-weight: 500; }
  &:focus { border-color: ${Pista8Theme.primary}; box-shadow: 0 0 0 3px ${Pista8Theme.primary}15; }
`;

const DateRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
  width: 100%;
  max-width: 650px;
  align-items: flex-end;
`;

const PrivacyToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border-radius: 14px;
  border: 1.5px solid rgba(72,80,84,0.12);
  margin-bottom: 24px;
  width: 100%;
  max-width: 650px;
  transition: all 0.2s;
  &:hover { border-color: ${Pista8Theme.primary}40; background: ${Pista8Theme.primary}05; }
`;

const ShareLinkSection = styled.div`
  background: rgba(248,249,250,1);
  padding: 20px;
  border-radius: 16px;
  border: 1px solid rgba(72,80,84,0.1);
  margin-bottom: 24px;
  width: 100%;
  max-width: 650px;
  animation: ${fadeUp} 0.3s ease both;
`;

const CopyBtn = styled.button`
  padding: 0 16px;
  height: 48px;
  border-radius: 12px;
  background: white;
  border: 1.5px solid rgba(72,80,84,0.15);
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  color: ${Pista8Theme.secondary};
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  &:hover { border-color: ${Pista8Theme.primary}; color: ${Pista8Theme.primary}; background: ${Pista8Theme.primary}05; }
`;

const FormActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid rgba(72,80,84,0.07);
  width: 100%;
  max-width: 650px;
`;

const GhostBtn = styled.button`
  padding: 0 24px;
  height: 48px;
  border-radius: 12px;
  border: 1.5px solid rgba(72,80,84,0.2);
  background: transparent;
  color: #a8b0b8;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover { border-color: rgba(72,80,84,0.4); color: ${Pista8Theme.secondary}; background: rgba(72,80,84,0.04); }
`;

const DraftBtn = styled.button`
  padding: 0 24px;
  height: 48px;
  border-radius: 12px;
  border: 1.5px solid ${Pista8Theme.secondary};
  background: transparent;
  color: ${Pista8Theme.secondary};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover { background: ${Pista8Theme.secondary}; color: white; }
  &:disabled { opacity: 0.35; cursor: default; }
`;

const PreviewCard = styled.div`
  border-radius: 20px;
  overflow: hidden;
  border: 1.5px solid rgba(72,80,84,0.1);
  animation: ${fadeUp} 0.3s ease both;
  width: 100%;
  max-width: 650px;
`;

const PreviewHead = styled.div`
  background: linear-gradient(160deg, #2c3438 0%, #1a1f22 100%);
  padding: 48px 32px;
  position: relative;
  overflow: hidden;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
`;

const PreviewGrid = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none;
`;

const PreviewRoleTag = styled.span`
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: white;
  background: ${Pista8Theme.primary};
  padding: 4px 10px;
  border-radius: 6px;
  display: inline-block;
  margin-bottom: 14px;
  position: relative;
`;

const PreviewTitle = styled.h2`
  font-size: 28px;
  font-weight: 900;
  color: white;
  margin: 0;
  letter-spacing: -0.3px;
  position: relative;
`;

const PreviewBody = styled.div`
  padding: 28px 32px;
  background: rgba(248,249,250,0.6);
`;

const PreviewDescription = styled.p`
  font-size: 14px;
  color: ${Pista8Theme.secondary};
  line-height: 1.7;
  margin: 0 0 20px;
  font-weight: 500;
`;

const PreviewFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid rgba(72,80,84,0.08);
`;

const PreviewBadge = styled.span<{ type: 'privacy' | 'date' }>`
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 4px 10px;
  border-radius: 6px;
  background: ${p => p.type === 'privacy' ? Pista8Theme.secondary + '10' : Pista8Theme.primary + '10'};
  color: ${p => p.type === 'privacy' ? Pista8Theme.secondary : Pista8Theme.primary};
`;

export const AdminDashboard = () => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab ] = useState('challenges');
  const [showForm, setShowForm] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [copyStatus, setCopyStatus] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    isPrivate: false,
    token: ''
  });

  const togglePrivacy = () => {
    const nextPrivate = !formData.isPrivate;
    setFormData({
      ...formData,
      isPrivate: nextPrivate,
      token: nextPrivate ? crypto.randomUUID() : ''
    });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const start = e.target.value;
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    setFormData({ 
      ...formData, 
      startDate: start, 
      endDate: end.toISOString().split('T')[0] 
    });
  };

  const copyToClipboard = () => {
    const link = `pista8.com/challenges/private/${formData.token}`;
    navigator.clipboard.writeText(link);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = '/auth';
  };

  const isFormValid = formData.title.trim() !== '' && formData.description.trim() !== '' && formData.endDate !== '';

  return (
    <Root>
      <Sidebar>
        <div style={{ flex: 1 }}>
          <SidebarBrand>
            <svg viewBox="0 0 280 72" xmlns="http://www.w3.org/2000/svg" width="110" height="28">
              <text x="0" y="60" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="64" fill="white" letterSpacing="-2">PIST</text>
              <polygon points="186,7 202,40 195,40 195,62 179,62 179,40 172,40" fill="#FE410A" />
              <rect x="181" y="65" width="5" height="8" rx="2" fill="#FE410A" />
              <rect x="189" y="65" width="5" height="8" rx="2" fill="#FE410A" />
              <rect x="197" y="65" width="5" height="8" rx="2" fill="#FE410A" />
              <text x="209" y="60" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="64" fill="white">8</text>
            </svg>
          </SidebarBrand>

          <UserProfileBlock>
            <RoleTag>{userProfile?.role?.toUpperCase()}</RoleTag>
            <UserName>{userProfile?.displayName}</UserName>
          </UserProfileBlock>

          <SidebarNav>
            <NavBtn active={activeTab === 'challenges'} onClick={() => { setActiveTab('challenges'); setShowForm(false); setIsPreview(false); }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
              Gestión de Retos
            </NavBtn>
            <NavBtn active={activeTab === 'stats'} onClick={() => { setActiveTab('stats'); setShowForm(false); setIsPreview(false); }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Estadísticas
            </NavBtn>
          </SidebarNav>
        </div>

        <SidebarFooter>
          <LogoutButton onClick={handleLogout} />
        </SidebarFooter>
      </Sidebar>

      <Main>
        <PageHeader>
          <PageTitle>
            {userProfile?.role === 'company' ? 'Panel Corporativo' : 'Panel Administrativo'}
          </PageTitle>
        </PageHeader>

        <Canvas>
          {activeTab === 'challenges' && (
            <>
              {!showForm ? (
                <EmptyState>
                  <EmptyIcon>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={Pista8Theme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                  </EmptyIcon>
                  <EmptyLabel>No hay retos activos todavía.Iniciá uno para el Sprint 1.</EmptyLabel>
                  <PrimaryBtn onClick={() => setShowForm(true)}>Crear Nuevo Reto</PrimaryBtn>
                </EmptyState>
              ) : (
                <Builder>
                  <BuilderNav>
                    <TabBtn active={!isPreview} onClick={() => setIsPreview(false)}>Editor</TabBtn>
                    <TabBtn active={isPreview} onClick={() => setIsPreview(true)}>Vista Previa</TabBtn>
                  </BuilderNav>

                  <BuilderBody>
                    {isPreview ? (
                      <PreviewCard>
                        <PreviewHead>
                          <PreviewGrid />
                          <PreviewRoleTag>{userProfile?.role?.toUpperCase()} lanza</PreviewRoleTag>
                          <PreviewTitle>{formData.title || 'Título del Reto'}</PreviewTitle>
                        </PreviewHead>
                        <PreviewBody>
                          <PreviewDescription>
                            {formData.description || 'Sin descripción todavía...'}
                          </PreviewDescription>
                          <PreviewFooter>
                            <PreviewBadge type="privacy">{formData.isPrivate ? 'Privado' : 'Público'}</PreviewBadge>
                            <PreviewBadge type="date">Expira: {formData.endDate || '--'}</PreviewBadge>
                          </PreviewFooter>
                        </PreviewBody>
                      </PreviewCard>
                    ) : (
                      <>
                        <FormGroup>
                          <FieldLabel>Título del Desafío</FieldLabel>
                          <Input 
                            placeholder="Ej: Rediseñar el sistema de becas..."
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                          />
                        </FormGroup>

                        <FormGroup>
                          <FieldLabel>Planteamiento del Problema</FieldLabel>
                          <Textarea 
                            placeholder="Describe el problema que los participantes deben resolver..."
                            rows={5}
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                          />
                        </FormGroup>

                        <PrivacyToggleRow>
                          <div>
                            <FieldLabel style={{ color: Pista8Theme.secondary }}>Visibilidad del Reto</FieldLabel>
                            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#a8b0b8' }}>
                              {formData.isPrivate ? 'Solo accesible con invitación.' : 'Visible para todos los estudiantes.'}
                            </p>
                          </div>
                          <input 
                            type="checkbox" 
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            checked={formData.isPrivate}
                            onChange={togglePrivacy}
                          />
                        </PrivacyToggleRow>

                        {formData.isPrivate && (
                          <ShareLinkSection>
                            <FieldLabel style={{ color: Pista8Theme.primary, marginBottom: '12px' }}>Enlace de Invitación</FieldLabel>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <Input 
                                readOnly 
                                style={{ flex: 1, fontSize: '13px', background: 'white' }}
                                value={`pista8.com/challenges/private/${formData.token}`}
                              />
                              <CopyBtn onClick={copyToClipboard}>
                                {copyStatus ? '¡Copiado!' : 'Copiar'}
                              </CopyBtn>
                            </div>
                          </ShareLinkSection>
                        )}

                        <DateRow>
                          <FormGroup style={{ marginBottom: 0 }}>
                            <FieldLabel>Fecha de Inicio</FieldLabel>
                            <Input type="date" value={formData.startDate} onChange={handleStartDateChange} />
                          </FormGroup>
                          <FormGroup style={{ marginBottom: 0 }}>
                            <FieldLabel>Fecha de Cierre (mín. +7 días desde inicio)</FieldLabel>
                            <Input 
                              type="date" 
                              value={formData.endDate} 
                              min={formData.endDate}
                              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                            />
                          </FormGroup>
                        </DateRow>

                        <FormActions>
                          <GhostBtn type="button" onClick={() => setShowForm(false)}>Cancelar</GhostBtn>
                          <DraftBtn type="button" disabled={!isFormValid}>Guardar Borrador</DraftBtn>
                          <PrimaryBtn type="button" disabled={!isFormValid}>Publicar Reto</PrimaryBtn>
                        </FormActions>
                      </>
                    )}
                  </BuilderBody>
                </Builder>
              )}
            </>
          )}

          {activeTab === 'stats' && (
             <EmptyState>
                <EmptyLabel>El módulo de estadísticas estará disponible en el Sprint 2.</EmptyLabel>
             </EmptyState>
          )}
        </Canvas>
      </Main>
    </Root>
  );
};