import { useState, useEffect } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { Pista8Theme } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import LogoutButton from './LogoutButton';
import { ideaService } from '../../services/idea.service';
import { userService } from '../../services/user.service';
import type { UserProfile } from '../../services/user.service';

const mockChallenges = [
  { id: 1, title: 'Reto de Ingeniería UNIVALLE 2026', category: 'Ingeniería', ideas: 24, likes: 187, badge: 'ACTIVO' },
  { id: 2, title: 'Innovación Sostenible Campus', category: 'Sostenibilidad', ideas: 15, likes: 102, badge: 'NUEVO' },
  { id: 3, title: 'App para Bienestar Estudiantil', category: 'Tecnología', ideas: 31, likes: 243, badge: 'ACTIVO' },
];

const topFacultades = [
  { name: 'Ingeniería', likes: 187 },
  { name: 'Ciencias', likes: 143 },
  { name: 'Humanidades', likes: 98 },
  { name: 'Medicina', likes: 76 },
  { name: 'Derecho', likes: 54 },
];

const topLideres = [
  { name: 'Valentina R.', ideas: 12 },
  { name: 'Mateo G.', ideas: 9 },
  { name: 'Camila P.', ideas: 7 },
  { name: 'Andrés L.', ideas: 6 },
  { name: 'Sofía M.', ideas: 5 },
];

type ConsentKey = 'terms' | 'usage' | 'originality';
type FormErrorKey = 'challenge' | 'ideaName' | 'ideaDevelopment' | 'consents';
type FormErrors = Partial<Record<FormErrorKey, string>>;
type FeedbackTone = 'success' | 'error' | 'info' | 'critical';
type FeedbackMessage = {
  tone: FeedbackTone;
  message: string;
  title?: string;
  persist?: boolean;
};

const FEEDBACK_GLYPH: Record<FeedbackTone, string> = {
  success: 'OK',
  error: '✕',
  info: 'i',
  critical: '!',
};

const FEEDBACK_PALETTE: Record<FeedbackTone, { border: string; background: string; color: string }> = {
  success: {
    border: 'rgba(34,134,58,0.3)',
    background: 'rgba(34,134,58,0.1)',
    color: '#205732',
  },
  error: {
    border: 'rgba(198,40,40,0.32)',
    background: 'rgba(198,40,40,0.12)',
    color: '#7a1b1b',
  },
  info: {
    border: 'rgba(21,83,138,0.3)',
    background: 'rgba(21,83,138,0.12)',
    color: '#12446c',
  },
  critical: {
    border: 'rgba(156,80,0,0.32)',
    background: 'rgba(156,80,0,0.14)',
    color: '#6d3800',
  },
};

const extractMessage = (raw: unknown): string | undefined => {
  if (typeof raw === 'string') {
    return raw;
  }
  if (Array.isArray(raw)) {
    return raw.join(' ');
  }
  return undefined;
};

const interpretBackendError = (error: any): FeedbackMessage => {
  if (error?.code === 'ERR_NETWORK') {
    return {
      tone: 'critical',
      title: 'Sin conexión',
      message: 'Perdimos contacto con el servidor. Revisa tu red e inténtalo nuevamente.',
      persist: true,
    };
  }

  const status = error?.response?.status;
  const backendMessage = extractMessage(error?.response?.data?.message);

  if (status === 400) {
    return {
      tone: 'error',
      title: 'Revisa los campos',
      message: backendMessage || 'Hay información pendiente antes de continuar.',
    };
  }

  if (status === 401) {
    return {
      tone: 'critical',
      title: 'Sesión caducada',
      message: 'Vuelve a iniciar sesión para continuar.',
      persist: true,
    };
  }

  if (status && status >= 500) {
    return {
      tone: 'critical',
      title: 'Servicio en pausa',
      message: 'El hub está teniendo problemas. Estamos trabajando para restablecerlo.',
      persist: true,
    };
  }

  return {
    tone: 'error',
    title: 'No pudimos completar la acción',
    message: backendMessage || 'Intenta nuevamente en unos segundos.',
  };
};

const IdeationWall = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedChallenge, setSelectedChallenge] = useState<any>(mockChallenges[0]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [filterOpen, setFilterOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formChallenge, setFormChallenge] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState('');
  if (profileError) console.debug('[Pista8] Error de perfil:', profileError);
  const [formSaving, setFormSaving] = useState(false);
  const [savingAction, setSavingAction] = useState<'draft' | 'public' | null>(null);
  const [formFeedback, setFormFeedback] = useState<FeedbackMessage | null>(null);
  const [toastMessage, setToastMessage] = useState<FeedbackMessage | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [consentsTouched, setConsentsTouched] = useState(false);
  const [ideaName, setIdeaName] = useState('');
  const [ideaDevelopment, setIdeaDevelopment] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [consents, setConsents] = useState<Record<ConsentKey, boolean>>({
    terms: false,
    usage: false,
    originality: false,
  });
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const maxIdeaName = 150;
  const maxIdeaDevelopment = 5000;
  const minIdeaName = 5;
  const minIdeaDevelopment = 20;
  const maxTags = 6;
  const filters = ['Todos', 'Ingeniería', 'Tecnología', 'Sostenibilidad'];
  const firstName = user?.displayName?.split(' ')[0] || 'Innovador';
  const fullName = user?.displayName?.trim() || user?.email || 'Guest';
  const isGuest = !user;
  const consentItems: Array<{ key: ConsentKey; title: string; desc: string }> = [
    { key: 'terms', title: 'Aceptación de términos', desc: 'Acepto las políticas del programa y la guía de participación institucional.' },
    { key: 'usage', title: 'Autorización de uso de la idea', desc: 'Autorizo a la universidad a compartir y prototipar esta propuesta dando el crédito correspondiente.' },
    { key: 'originality', title: 'Declaración de originalidad', desc: 'Declaro que la idea es resultado de mi trabajo y citando cualquier referencia externa.' },
  ];
  const allConsentsAccepted = Object.values(consents).every(Boolean);
  const checklist = [
    { label: 'Reto asignado', done: !!formChallenge },
    { label: 'Nombre de la idea', done: ideaName.trim().length >= minIdeaName },
    { label: 'Desarrollo narrado', done: ideaDevelopment.trim().length >= minIdeaDevelopment },
    { label: 'Consentimientos', done: allConsentsAccepted },
  ];

  useEffect(() => {
    let active = true;
    if (!user) {
      setProfile(null);
      return;
    }
    (async () => {
      try {
        setProfileError('');
        const data = await userService.getProfile();
        if (active) {
          setProfile(data);
        }
      } catch (error: any) {
        if (active) {
          setProfileError(error?.message || 'No pudimos cargar tu perfil.');
        }
      }
    })();
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (formOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originalOverflow;
    }
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [formOpen]);

  useEffect(() => {
    if (!toastMessage || toastMessage.persist) {
      return;
    }
    const timeout = window.setTimeout(() => setToastMessage(null), 4800);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  const showToast = (payload: FeedbackMessage) => {
    setToastMessage(payload);
  };

  const dismissToast = () => setToastMessage(null);

  const clearFieldError = (field: FormErrorKey) => {
    setFormErrors(prev => {
      if (!prev[field]) {
        return prev;
      }
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const getFieldError = (field: FormErrorKey): string | undefined => {
    if (field === 'challenge' && !formChallenge) {
      return 'Selecciona un reto para vincular tu propuesta.';
    }
    if (field === 'ideaName' && ideaName.trim().length < minIdeaName) {
      return `Ingresa al menos ${minIdeaName} caracteres.`;
    }
    if (field === 'ideaDevelopment' && ideaDevelopment.trim().length < minIdeaDevelopment) {
      return `Describe tu idea con mínimo ${minIdeaDevelopment} caracteres.`;
    }
    if (field === 'consents' && !allConsentsAccepted) {
      return 'Acepta los tres consentimientos (ejemplo: si “App para Bienestar Estudiantil” llega al laboratorio, debemos poder prototiparla citándote).';
    }
    return undefined;
  };

  const validateField = (field: FormErrorKey) => {
    const errorMessage = getFieldError(field);
    setFormErrors(prev => {
      const next = { ...prev };
      if (errorMessage) {
        next[field] = errorMessage;
      } else {
        delete next[field];
      }
      return next;
    });
    return !errorMessage;
  };

  const validatePublicSubmission = (): FormErrors => {
    const errors: FormErrors = {};
    (['challenge', 'ideaName', 'ideaDevelopment', 'consents'] as FormErrorKey[]).forEach(field => {
      const errorMessage = getFieldError(field);
      if (errorMessage) {
        errors[field] = errorMessage;
      }
    });
    return errors;
  };

  useEffect(() => {
    if (!consentsTouched) {
      return;
    }
    setFormErrors(prev => {
      const next = { ...prev };
      if (!allConsentsAccepted) {
        next.consents = 'Acepta los tres consentimientos (ejemplo: si “App para Bienestar Estudiantil” llega al laboratorio, debemos poder prototiparla citándote).';
      } else {
        delete next.consents;
      }
      return next;
    });
  }, [consentsTouched, allConsentsAccepted]);

  const resetForm = () => {
    setIdeaName('');
    setIdeaDevelopment('');
    setTags([]);
    setTagInput('');
    setConsents({ terms: false, usage: false, originality: false });
    setFormErrors({});
    setConsentsTouched(false);
  };

  const handleOpenForm = (challenge: any) => {
    setFormChallenge(challenge);
    setSelectedChallenge(challenge);
    resetForm();
    setFormFeedback(null);
    setFormSaving(false);
    setSavingAction(null);
    clearFieldError('challenge');
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setFormChallenge(null);
    resetForm();
    setFormFeedback(null);
    setFormSaving(false);
    setSavingAction(null);
    clearFieldError('challenge');
    setConfirmSubmitOpen(false);
  };

  const handleTagAddition = () => {
    const sanitized = tagInput.trim();
    if (!sanitized) return;
    setTags(prev => {
      if (prev.includes(sanitized) || prev.length >= maxTags) {
        return prev;
      }
      return [...prev, sanitized];
    });
    setTagInput('');
  };

  // Allow ideators to capture tags rápidamente sin abandonar el teclado.
  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      handleTagAddition();
    }
    if (event.key === 'Backspace' && !tagInput && tags.length) {
      event.preventDefault();
      setTags(prev => prev.slice(0, -1));
    }
  };

  const handleTagRemoval = (target: string) => {
    setTags(prev => prev.filter(tag => tag !== target));
  };

  const toggleConsent = (key: ConsentKey) => {
    setConsents(prev => ({ ...prev, [key]: !prev[key] }));
    setConsentsTouched(true);
  };

  const readyToSend = Boolean(
    formChallenge &&
    ideaName.trim().length >= minIdeaName &&
    ideaDevelopment.trim().length >= minIdeaDevelopment &&
    allConsentsAccepted,
  );

  const normalizedTags = () => Array.from(new Set(tags.map(tag => tag.trim()).filter(Boolean)));

  const handleIdeaSubmit = async (targetStatus: 'draft' | 'public'): Promise<boolean> => {
    if (!profile?._id) {
      const message = {
        tone: 'critical' as FeedbackTone,
        title: 'Perfil no disponible',
        message: 'Necesitamos sincronizar tu sesión nuevamente antes de continuar.',
        persist: true,
      };
      setFormFeedback(message);
      showToast(message);
      return false;
    }
    if (!formChallenge) {
      setFormFeedback({
        tone: 'info',
        title: 'Elige un reto',
        message: 'Vincula tu idea a uno de los retos activos antes de continuar.',
      });
      return false;
    }
    const title = ideaName.trim();
    const description = ideaDevelopment.trim();

    if (targetStatus === 'public') {
      const publicErrors = validatePublicSubmission();
      setFormErrors(publicErrors);
      setConsentsTouched(true);
      if (Object.keys(publicErrors).length) {
        setFormFeedback({
          tone: 'error',
          title: 'Revisa los campos',
          message: 'Corrige los campos marcados en rojo antes de compartir tu idea.',
        });
        return false;
      }
    }

    setFormSaving(true);
    setSavingAction(targetStatus);
    setFormFeedback(null);

    let success = false;
    try {
      if (targetStatus === 'draft') {
        await ideaService.saveDraftIdea({
          title: title || undefined,
          description: description || undefined,
          tags: normalizedTags(),
          author: profile._id,
          isAnonymous: isGuest,
        });
        showToast({
          tone: 'info',
          title: 'Borrador guardado',
          message: 'Guardamos tus avances. Puedes retomarlos cuando quieras.',
        });
        success = true;
      } else {
        await ideaService.createIdea({
          title,
          description,
          tags: normalizedTags(),
          status: targetStatus,
          author: profile._id,
          isAnonymous: isGuest,
        });
        const successMessage: FeedbackMessage = {
          tone: 'success',
          title: 'Idea enviada',
          message: 'Tu propuesta ya está registrada. Te avisaremos si necesitamos más información.',
        };
        setFormFeedback(successMessage);
        showToast(successMessage);
        resetForm();
        success = true;
      }
    } catch (error: any) {
      const interpreted = interpretBackendError(error);
      setFormFeedback(interpreted);
      if (interpreted.persist || interpreted.tone === 'critical') {
        showToast(interpreted);
      }
    } finally {
      setFormSaving(false);
      setSavingAction(null);
    }
    return success;
  };

  const handleConfirmSubmit = async () => {
    if (formSaving) {
      return;
    }
    setConfirmSubmitOpen(false);
    const success = await handleIdeaSubmit('public');
    if (success) {
      handleCloseForm();
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const publicErrors = validatePublicSubmission();
    setFormErrors(publicErrors);
    setConsentsTouched(true);
    if (Object.keys(publicErrors).length) {
      setFormFeedback({
        tone: 'error',
        title: 'Revisa tu propuesta',
        message: 'Completa los campos marcados en rojo antes de compartir.',
      });
      return;
    }
    setFormFeedback(null);
    setConfirmSubmitOpen(true);
  };

  return (
    <Root>
      <Overlay $open={sidebarOpen} onClick={() => setSidebarOpen(false)} />

      <Sidebar $open={sidebarOpen}>
        <SidebarTop>
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
          <SidebarClose onClick={() => setSidebarOpen(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </SidebarClose>
        </SidebarTop>

        <SidebarNav>
          <SidebarNavItem $active onClick={() => { setSidebarOpen(false); navigate('/'); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Ver Retos
          </SidebarNavItem>
          <SidebarNavItem onClick={() => { setSidebarOpen(false); navigate('/profile'); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Mi Perfil
          </SidebarNavItem>
          <SidebarNavItem>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Mis Ideas
          </SidebarNavItem>
        </SidebarNav>

        <SidebarFooter>
          <LogoutButton />
        </SidebarFooter>
      </Sidebar>

      <Page>
        <Header>
          <WelcomeZone>
            <Greeting>Hola, <span>{firstName}</span></Greeting>
            <Sub>¿Listo para despegar tu próxima gran idea?</Sub>
          </WelcomeZone>

          <HamburgerBtn onClick={() => setSidebarOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </HamburgerBtn>
        </Header>

        <Hangar>
          <HangarGrid />
          <HangarLabel>PISTA 8 — HANGAR DE IDEAS</HangarLabel>
          <HangarSub>Próximamente: ideas en tiempo real</HangarSub>
          <HangarGlow />
        </Hangar>

        <MainGrid>
          <LeftPanel>
            <PanelHeader>
              <PanelTitle>Retos activos</PanelTitle>
              <FilterWrap>
                <FilterBtn onClick={() => setFilterOpen(!filterOpen)} $active={filterOpen}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                    <line x1="11" y1="18" x2="13" y2="18" />
                  </svg>
                </FilterBtn>
                {filterOpen && (
                  <FilterDropdown>
                    {filters.map(f => (
                      <FilterOption
                        key={f}
                        $active={activeFilter === f}
                        onClick={() => { setActiveFilter(f); setFilterOpen(false); }}
                      >
                        {f}
                      </FilterOption>
                    ))}
                  </FilterDropdown>
                )}
              </FilterWrap>
            </PanelHeader>

            <ChallengeList>
              {mockChallenges
                .filter(c => activeFilter === 'Todos' || c.category === activeFilter)
                .map(c => (
                  <ChallengeCard
                    key={c.id}
                    $active={selectedChallenge?.id === c.id}
                    onClick={() => setSelectedChallenge(c)}
                  >
                    {selectedChallenge?.id === c.id && <ActiveBar />}
                    <TopRight>
                      {c.badge && <BadgeCorner>{c.badge}</BadgeCorner>}
                      <LikesChip>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                        {c.likes}
                      </LikesChip>
                    </TopRight>
                    <CardTop>
                      <CategoryTag>{c.category}</CategoryTag>
                    </CardTop>
                    <CardTitle>{c.title}</CardTitle>
                    <CardMeta>{c.ideas} ideas enviadas</CardMeta>
                    <CardActionRow>
                      <RespondButton
                        type="button"
                        onClick={event => {
                          event.stopPropagation();
                          handleOpenForm(c);
                        }}
                      >
                        Responder reto
                        <span aria-hidden="true">{'>'}</span>
                      </RespondButton>
                    </CardActionRow>
                  </ChallengeCard>
                ))}
            </ChallengeList>
          </LeftPanel>

          <RightPanel $hasChallenge={!!selectedChallenge}>
            {selectedChallenge ? (
              <>
                <StatsHeader>
                  <StatsTitle>Estadísticas</StatsTitle>
                  <StatsSub>{selectedChallenge.title}</StatsSub>
                </StatsHeader>

                <StatsSummary>
                  <SummaryCard>
                    <SummaryVal>{selectedChallenge.ideas}</SummaryVal>
                    <SummaryLabel>Ideas</SummaryLabel>
                  </SummaryCard>
                  <SummaryCard>
                    <SummaryVal>{selectedChallenge.likes}</SummaryVal>
                    <SummaryLabel>Likes</SummaryLabel>
                  </SummaryCard>
                  <SummaryCard>
                    <SummaryVal>{topLideres.length}</SummaryVal>
                    <SummaryLabel>Líderes</SummaryLabel>
                  </SummaryCard>
                </StatsSummary>

                <StatsColumns>
                  <StatsCol>
                    <ColLabel>Top Facultades</ColLabel>
                    {topFacultades.map((f, i) => (
                      <RankRow key={f.name}>
                        <RankNum>{i + 1}</RankNum>
                        <RankName>{f.name}</RankName>
                        <RankBar>
                          <RankFill $pct={Math.round((f.likes / topFacultades[0].likes) * 100)} $delay={i * 80} />
                        </RankBar>
                        <RankVal>{f.likes}</RankVal>
                      </RankRow>
                    ))}
                  </StatsCol>

                  <StatsDivider />

                  <StatsCol>
                    <ColLabel>Top Líderes</ColLabel>
                    {topLideres.map((l, i) => (
                      <RankRow key={l.name}>
                        <RankNum>{i + 1}</RankNum>
                        <RankName>{l.name}</RankName>
                        <RankBar>
                          <RankFill $pct={Math.round((l.ideas / topLideres[0].ideas) * 100)} $delay={i * 80} />
                        </RankBar>
                        <RankVal>{l.ideas}</RankVal>
                      </RankRow>
                    ))}
                  </StatsCol>
                </StatsColumns>
              </>
            ) : (
              <EmptyStats>
                <EmptyIcon>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </EmptyIcon>
                <p>Seleccioná un reto para ver sus estadísticas</p>
              </EmptyStats>
            )}
          </RightPanel>
        </MainGrid>
      </Page>
      {toastMessage && (
        <ToastViewport role="status" aria-live="polite">
          <ToastCard data-tone={toastMessage.tone} $tone={toastMessage.tone}>
            <ToastGlyph aria-hidden="true">{FEEDBACK_GLYPH[toastMessage.tone]}</ToastGlyph>
            <ToastContent>
              {toastMessage.title && <ToastTitle>{toastMessage.title}</ToastTitle>}
              <p>{toastMessage.message}</p>
            </ToastContent>
            <ToastDismiss type="button" onClick={dismissToast}>
              Cerrar
            </ToastDismiss>
          </ToastCard>
        </ToastViewport>
      )}
      {formOpen && (
        <>
          <ModalBackdrop onClick={handleCloseForm} />
          <ModalWrapper role="dialog" aria-modal="true" aria-labelledby="idea-form-title">
            <ModalCard>
              <ModalHalo />
              <ModalHeader>
                <div>
                  <ModalEyebrow>E02 / Formulario estructurado</ModalEyebrow>
                  <ModalTitle id="idea-form-title">{formChallenge?.title || 'Selecciona un reto'}</ModalTitle>
                  <ModalLead>
                    Comparte tu propuesta para este reto. Puedes guardar conceptos en borrador o compartirlos con el hub de innovación.
                  </ModalLead>
                </div>
                <ModalClose type="button" onClick={handleCloseForm} aria-label="Cerrar formulario">
                  ×
                </ModalClose>
              </ModalHeader>

              <FormGrid>
                <MetaColumn>
                  <MetaCard>
                    <MetaLabel>Nombre completo</MetaLabel>
                    <MetaValue>{fullName}</MetaValue>
                    <MetaFoot>{isGuest ? 'Participando como invitado (Guest)' : 'Sesión autenticada'}</MetaFoot>
                  </MetaCard>

                  <MetaCard $invalid={Boolean(formErrors.challenge)}>
                    <MetaLabel>Reto que respondes</MetaLabel>
                    <MetaValue>{formChallenge?.title || 'Selecciona un reto'}</MetaValue>
                    {formChallenge && <MetaBadge>{formChallenge.category}</MetaBadge>}
                    <MetaFoot>
                      {formChallenge ? `${formChallenge.ideas} ideas publicadas en este reto` : 'Elige un reto para asociar tu idea.'}
                    </MetaFoot>
                    {formErrors.challenge && <MetaError>{formErrors.challenge}</MetaError>}
                  </MetaCard>

                  <Checklist>
                    {checklist.map(item => (
                      <ChecklistItem key={item.label}>
                        <StatusDot $done={item.done} />
                        <ChecklistLabel>{item.label}</ChecklistLabel>
                      </ChecklistItem>
                    ))}
                  </Checklist>
                </MetaColumn>

                <FormCard onSubmit={handleSubmit}>
                  {formFeedback && (
                    <FeedbackBanner
                      data-tone={formFeedback.tone}
                      $tone={formFeedback.tone}
                      role={formFeedback.tone === 'error' || formFeedback.tone === 'critical' ? 'alert' : 'status'}
                    >
                      <BannerGlyph aria-hidden="true">{FEEDBACK_GLYPH[formFeedback.tone]}</BannerGlyph>
                      <div>
                        {formFeedback.title && <BannerTitle>{formFeedback.title}</BannerTitle>}
                        <p>{formFeedback.message}</p>
                      </div>
                    </FeedbackBanner>
                  )}
                  <Field>
                    <FieldHeader>
                      <Label>Nombre y/o info básica de la idea</Label>
                      <CharCounter>{ideaName.length}/{maxIdeaName}</CharCounter>
                    </FieldHeader>
                    <Tip>Usa un titular memorable de máximo {maxIdeaName} caracteres.</Tip>
                    <TextInput
                      value={ideaName}
                      onChange={event => {
                        setIdeaName(event.target.value);
                        if (formErrors.ideaName) {
                          clearFieldError('ideaName');
                        }
                      }}
                      onBlur={() => validateField('ideaName')}
                      placeholder="Ej. Corredor solar para el campus central"
                      maxLength={maxIdeaName}
                      $invalid={Boolean(formErrors.ideaName)}
                    />
                    {formErrors.ideaName && <FieldError>{formErrors.ideaName}</FieldError>}
                  </Field>

                  <Field>
                    <FieldHeader>
                      <Label>Desarrollo de la idea</Label>
                      <CharCounter>{ideaDevelopment.length}/{maxIdeaDevelopment}</CharCounter>
                    </FieldHeader>
                    <Tip>Describe problema, solución, impacto y actores clave.</Tip>
                    <TextArea
                      value={ideaDevelopment}
                      onChange={event => {
                        setIdeaDevelopment(event.target.value);
                        if (formErrors.ideaDevelopment) {
                          clearFieldError('ideaDevelopment');
                        }
                      }}
                      onBlur={() => validateField('ideaDevelopment')}
                      placeholder="Explica cómo surge la idea, qué recursos necesita y cómo mediremos el éxito..."
                      rows={7}
                      maxLength={maxIdeaDevelopment}
                      $invalid={Boolean(formErrors.ideaDevelopment)}
                    />
                    {formErrors.ideaDevelopment && <FieldError>{formErrors.ideaDevelopment}</FieldError>}
                  </Field>

                  <Field>
                    <FieldHeader>
                      <Label>Etiquetas</Label>
                      <TagCounter>{tags.length}/{maxTags}</TagCounter>
                    </FieldHeader>
                    <Tip>Agrega palabras clave y presiona Enter o coma para guardarlas.</Tip>
                    <TagInputWrap>
                      {tags.map(tag => (
                        <TagChip key={tag}>
                          {tag}
                          <RemoveTag type="button" onClick={() => handleTagRemoval(tag)} aria-label={`Quitar etiqueta ${tag}`}>
                            ×
                          </RemoveTag>
                        </TagChip>
                      ))}
                      <TagField
                        type="text"
                        value={tagInput}
                        onChange={event => setTagInput(event.target.value)}
                        onKeyDown={handleTagKeyDown}
                        placeholder="impacto, movilidad, energía..."
                        disabled={tags.length >= maxTags}
                      />
                      <AddTagButton type="button" onClick={handleTagAddition} disabled={tags.length >= maxTags}>
                        Añadir
                      </AddTagButton>
                    </TagInputWrap>
                  </Field>

                  <Field>
                    <Label>Consentimientos y condiciones</Label>
                    <Tip>Marca cada casilla para habilitar el envío.</Tip>
                    <ConsentList $invalid={Boolean(formErrors.consents) && consentsTouched}>
                      {consentItems.map(item => (
                        <ConsentItem key={item.key} $checked={consents[item.key]}>
                          <ConsentCheckbox
                            type="checkbox"
                            checked={consents[item.key]}
                            onChange={() => toggleConsent(item.key)}
                          />
                          <div>
                            <ConsentTitle>{item.title}</ConsentTitle>
                            <ConsentDescription>{item.desc}</ConsentDescription>
                          </div>
                        </ConsentItem>
                      ))}
                    </ConsentList>
                    {formErrors.consents && consentsTouched && (
                      <FieldError>{formErrors.consents}</FieldError>
                    )}
                  </Field>

                  <ButtonRow>
                    <GhostButton
                      type="button"
                      onClick={() => handleIdeaSubmit('draft')}
                      disabled={formSaving}
                    >
                      {formSaving && savingAction === 'draft' ? 'Guardando...' : 'Guardar como borrador'}
                    </GhostButton>
                    <CTAButton type="submit" disabled={formSaving || !readyToSend}>
                      {formSaving && savingAction === 'public' ? 'Enviando...' : 'Compartir idea'}
                    </CTAButton>
                  </ButtonRow>
                  <ButtonHint>
                    {readyToSend
                      ? 'Lista para enviarse o guardar cambios en cualquier momento.'
                      : 'Puedes guardar avances como borrador o completar los campos para enviarla.'}
                  </ButtonHint>
                </FormCard>
              </FormGrid>
            </ModalCard>
          </ModalWrapper>
          {confirmSubmitOpen && (
            <>
              <ConfirmBackdrop />
              <ConfirmDialog role="dialog" aria-modal="true" aria-labelledby="confirm-submit-title">
                <ConfirmCard>
                  <ConfirmTitle id="confirm-submit-title">¿Compartir esta idea con el hub?</ConfirmTitle>
                  <ConfirmText>
                    {ideaName.trim() ? `“${ideaName.trim()}”` : 'Tu propuesta'} se enviará a revisión del hub de innovación.
                    Confirma para cerrar el formulario y registrar el envío.
                  </ConfirmText>
                  <ConfirmSummary>
                    <SummaryPill>{formChallenge?.title || 'Reto sin seleccionar'}</SummaryPill>
                    <SummaryPill>{normalizedTags().length} etiquetas</SummaryPill>
                  </ConfirmSummary>
                  <ConfirmActions>
                    <ConfirmGhost type="button" onClick={() => setConfirmSubmitOpen(false)} disabled={formSaving}>
                      Seguir editando
                    </ConfirmGhost>
                    <ConfirmCTA type="button" onClick={handleConfirmSubmit} disabled={formSaving}>
                      {formSaving ? 'Enviando...' : 'Sí, compartir'}
                    </ConfirmCTA>
                  </ConfirmActions>
                </ConfirmCard>
              </ConfirmDialog>
            </>
          )}
        </>
      )}
    </Root>
  );
};

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
`;

const slideOut = keyframes`
  from { transform: translateX(0); }
  to   { transform: translateX(100%); }
`;

const fillBar = keyframes`
  from { width: 0%; }
  to   { width: 100%; }
`;

const Root = styled.div`
  min-height: 100vh;
  background: ${Pista8Theme.background};
  position: relative;
  overflow-x: hidden;
`;

const Overlay = styled.div<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(72, 80, 84, 0.4);
  backdrop-filter: blur(4px);
  z-index: 40;
  opacity: ${p => p.$open ? 1 : 0};
  pointer-events: ${p => p.$open ? 'all' : 'none'};
  transition: opacity 0.3s ease;
`;

const Sidebar = styled.aside<{ $open: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 300px;
  background: ${Pista8Theme.secondary};
  z-index: 50;
  display: flex;
  flex-direction: column;
  padding: 36px 28px 40px;
  animation: ${p => p.$open ? css`${slideIn} 0.32s cubic-bezier(.22,.68,0,1.1) both` : css`${slideOut} 0.28s ease both`};
  ${p => !p.$open && 'pointer-events: none;'}
`;

const SidebarTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 52px;
`;

const SidebarBrand = styled.div``;

const SidebarClose = styled.button`
  background: rgba(255,255,255,0.08);
  border: none;
  color: rgba(255,255,255,0.6);
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  &:hover { background: rgba(255,255,255,0.14); color: white; }
`;

const SidebarNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

const SidebarNavItem = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  text-align: left;
  padding: 18px 20px;
  border-radius: 16px;
  border: none;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  background: ${p => p.$active ? 'rgba(254,65,10,0.18)' : 'transparent'};
  color: ${p => p.$active ? '#FE410A' : 'rgba(255,255,255,0.55)'};
  letter-spacing: 0.01em;
  svg { width: 20px; height: 20px; flex-shrink: 0; }
  &:hover { background: rgba(255,255,255,0.07); color: white; }
`;

const SidebarFooter = styled.div`
  padding-top: 28px;
  padding-bottom: 8px;
  border-top: 1px solid rgba(255,255,255,0.08);
  display: flex;
  justify-content: center;
`;

const Page = styled.div`
  padding: 2.5rem 4%;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  animation: ${fadeUp} 0.4s ease both;
`;

const WelcomeZone = styled.div``;

const Greeting = styled.h1`
  font-size: 36px;
  font-weight: 900;
  color: ${Pista8Theme.secondary};
  margin: 0;
  letter-spacing: -0.5px;
  span { color: ${Pista8Theme.primary}; }
`;

const Sub = styled.p`
  font-size: 14px;
  color: #a8b0b8;
  margin: 6px 0 0;
  font-weight: 500;
`;

const HamburgerBtn = styled.button`
  width: 44px;
  height: 44px;
  background: white;
  border: 1px solid rgba(72,80,84,0.1);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${Pista8Theme.secondary};
  cursor: pointer;
  transition: border-color 0.18s, color 0.18s, transform 0.12s;
  &:hover { border-color: ${Pista8Theme.primary}; color: ${Pista8Theme.primary}; transform: scale(1.04); }
  &:active { transform: scale(0.96); }
`;

const Hangar = styled.section`
  position: relative;
  width: 100%;
  height: 180px;
  background: linear-gradient(160deg, #2c3438 0%, #1a1f22 100%);
  border-radius: 24px;
  margin-bottom: 2rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  animation: ${fadeUp} 0.4s 0.05s ease both;
`;

const HangarGrid = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none;
`;

const HangarLabel = styled.p`
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.18em;
  color: rgba(255,255,255,0.3);
  text-transform: uppercase;
  margin: 0;
  position: relative;
`;

const HangarSub = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: rgba(255,255,255,0.18);
  margin: 0;
  position: relative;
`;

const HangarGlow = styled.div`
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 100px;
  background: radial-gradient(ellipse, rgba(254,65,10,0.2) 0%, transparent 70%);
  pointer-events: none;
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  animation: ${fadeUp} 0.4s 0.1s ease both;
  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const LeftPanel = styled.div`
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 32px;
  border: 1px solid rgba(255,255,255,0.9);
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const PanelTitle = styled.h2`
  font-size: 17px;
  font-weight: 800;
  color: ${Pista8Theme.secondary};
  margin: 0;
`;

const FilterWrap = styled.div`
  position: relative;
`;

const FilterBtn = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 11px;
  border: 1.5px solid ${p => p.$active ? Pista8Theme.primary : 'rgba(72,80,84,0.15)'};
  background: ${p => p.$active ? `${Pista8Theme.primary}12` : 'transparent'};
  color: ${p => p.$active ? Pista8Theme.primary : Pista8Theme.secondary};
  cursor: pointer;
  transition: all 0.18s;
  &:hover { border-color: ${Pista8Theme.primary}; color: ${Pista8Theme.primary}; }
`;

const FilterDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border: 1px solid rgba(72,80,84,0.1);
  border-radius: 16px;
  padding: 6px;
  z-index: 10;
  min-width: 160px;
  box-shadow: 0 12px 32px rgba(72,80,84,0.14);
  animation: ${fadeUp} 0.18s ease both;
`;

const FilterOption = styled.button<{ $active: boolean }>`
  display: block;
  width: 100%;
  text-align: left;
  padding: 10px 14px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: ${p => p.$active ? '700' : '500'};
  color: ${p => p.$active ? Pista8Theme.primary : Pista8Theme.secondary};
  background: ${p => p.$active ? `${Pista8Theme.primary}10` : 'transparent'};
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: rgba(72,80,84,0.05); }
`;

const ChallengeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const ChallengeCard = styled.div<{ $active: boolean }>`
  position: relative;
  padding: 20px 22px;
  border-radius: 18px;
  border: 1.5px solid ${p => p.$active ? Pista8Theme.primary : 'rgba(72,80,84,0.07)'};
  background: ${p => p.$active ? `${Pista8Theme.primary}07` : 'rgba(248,249,250,0.8)'};
  cursor: pointer;
  transition: all 0.22s ease;
  overflow: hidden;
  &:hover {
    border-color: ${Pista8Theme.primary};
    transform: translateX(4px);
    box-shadow: 0 4px 20px rgba(254,65,10,0.08);
  }
`;

const ActiveBar = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  background: ${Pista8Theme.primary};
  border-radius: 0 4px 4px 0;
`;

const TopRight = styled.div`
  position: absolute;
  top: 14px;
  right: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const BadgeCorner = styled.span`
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: white;
  background: ${Pista8Theme.primary};
  padding: 3px 8px;
  border-radius: 6px;
`;

const CardTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const CategoryTag = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: ${Pista8Theme.primary};
  background: ${Pista8Theme.primary}15;
  padding: 3px 10px;
  border-radius: 6px;
  letter-spacing: 0.02em;
`;

const LikesChip = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #a8b0b8;
  font-weight: 600;
  svg { color: #e8a0a0; }
`;

const CardTitle = styled.p`
  font-size: 14px;
  font-weight: 700;
  color: ${Pista8Theme.secondary};
  margin: 0 0 8px;
  line-height: 1.45;
`;

const CardMeta = styled.p`
  font-size: 12px;
  color: #b8c0c8;
  margin: 0;
  font-weight: 500;
`;

const CardActionRow = styled.div`
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
`;

const RespondButton = styled.button`
  border: none;
  background: ${Pista8Theme.primary};
  color: white;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 10px 18px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  box-shadow: 0 14px 28px rgba(254,65,10,0.25);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  span { font-size: 14px; }
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 32px rgba(254,65,10,0.35);
  }
`;

const RightPanel = styled.div<{ $hasChallenge: boolean }>`
  background: ${Pista8Theme.secondary};
  border-radius: 24px;
  padding: 32px;
  border: 1px solid rgba(72,80,84,0.1);
  opacity: ${p => p.$hasChallenge ? 1 : 0.35};
  transition: opacity 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

const StatsHeader = styled.div``;

const StatsTitle = styled.h3`
  font-size: 19px;
  font-weight: 800;
  color: white;
  margin: 0 0 6px;
`;

const StatsSub = styled.p`
  font-size: 13px;
  color: rgba(255,255,255,0.38);
  margin: 0;
  font-weight: 500;
  line-height: 1.4;
`;

const StatsSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

const SummaryCard = styled.div`
  background: rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 20px 12px;
  text-align: center;
  border: 1px solid rgba(255,255,255,0.07);
  transition: background 0.18s;
  &:hover { background: rgba(255,255,255,0.1); }
`;

const SummaryVal = styled.p`
  font-size: 30px;
  font-weight: 900;
  color: white;
  margin: 0 0 4px;
  letter-spacing: -0.5px;
`;

const SummaryLabel = styled.p`
  font-size: 12px;
  color: rgba(255,255,255,0.35);
  margin: 0;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const StatsColumns = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 0 20px;
  flex: 1;
`;

const StatsCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 13px;
`;

const ColLabel = styled.p`
  font-size: 12px;
  font-weight: 700;
  color: rgba(255,255,255,0.3);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 4px;
`;

const StatsDivider = styled.div`
  width: 1px;
  background: rgba(255,255,255,0.08);
  align-self: stretch;
`;

const RankRow = styled.div`
  display: grid;
  grid-template-columns: 16px 1fr 40px 28px;
  align-items: center;
  gap: 8px;
`;

const RankNum = styled.span`
  font-size: 11px;
  font-weight: 800;
  color: rgba(255,255,255,0.25);
`;

const RankName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RankBar = styled.div`
  height: 3px;
  background: rgba(255,255,255,0.08);
  border-radius: 2px;
  overflow: hidden;
`;

const RankFill = styled.div<{ $pct: number; $delay: number }>`
  height: 100%;
  width: ${p => p.$pct}%;
  background: ${Pista8Theme.primary};
  border-radius: 2px;
  animation: ${fillBar} 0.55s ${p => p.$delay}ms ease both;
`;

const RankVal = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: rgba(255,255,255,0.4);
  text-align: right;
`;

const EmptyStats = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 14px;
  color: rgba(255,255,255,0.25);
  text-align: center;
  font-size: 13px;
  font-weight: 500;
`;

const EmptyIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(17, 22, 26, 0.65);
  backdrop-filter: blur(3px);
  z-index: 80;
`;

const ModalWrapper = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  z-index: 90;
  overflow-y: auto;
  overscroll-behavior: contain;
`;

const ModalCard = styled.section`
  width: min(1100px, 100%);
  padding: 48px;
  border-radius: 32px;
  background: linear-gradient(135deg, #fff5ed 0%, #eef2ff 60%, #f8fbff 100%);
  border: 1px solid rgba(72,80,84,0.08);
  position: relative;
  overflow: hidden;
  animation: ${fadeUp} 0.3s ease both;
  box-shadow: 0 45px 90px rgba(26,31,36,0.25);
  max-height: calc(100vh - 80px);
  overflow-y: auto;
  @media (max-width: 640px) {
    padding: 32px 22px;
  }
`;

const ModalHalo = styled.div`
  position: absolute;
  inset: -20% auto auto -15%;
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, rgba(254,65,10,0.15) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
`;

const ModalHeader = styled.div`
  position: relative;
  z-index: 1;
  margin-bottom: 32px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
`;

const ModalEyebrow = styled.p`
  font-size: 12px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  font-weight: 800;
  color: rgba(72,80,84,0.6);
  margin: 0 0 12px;
`;

const ModalTitle = styled.h2`
  font-size: 34px;
  font-weight: 800;
  margin: 0 0 10px;
  color: ${Pista8Theme.secondary};
`;

const ModalLead = styled.p`
  font-size: 16px;
  color: rgba(72,80,84,0.8);
  line-height: 1.6;
  margin: 0;
`;

const ModalClose = styled.button`
  border: none;
  background: rgba(255,255,255,0.7);
  width: 40px;
  height: 40px;
  border-radius: 12px;
  font-size: 20px;
  font-weight: 700;
  color: ${Pista8Theme.secondary};
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease;
  &:hover {
    transform: scale(1.05);
    background: white;
  }
`;

const FormGrid = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 28px;
  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const MetaColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const FieldError = styled.p`
  font-size: 12px;
  color: #c62828;
  margin: -4px 0 0;
  font-weight: 600;
`;

const MetaCard = styled.div<{ $invalid?: boolean }>`
  background: rgba(255,255,255,0.92);
  border-radius: 22px;
  padding: 22px;
  border: 1px solid ${p => (p.$invalid ? '#ff8a8a' : 'rgba(72,80,84,0.08)')};
  box-shadow: 0 20px 35px rgba(72,80,84,0.1);
  ${p => p.$invalid && css`
    box-shadow: 0 0 0 2px rgba(255,138,138,0.3);
  `}
`;

const MetaLabel = styled.p`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(72,80,84,0.55);
  margin: 0 0 6px;
`;

const MetaValue = styled.p`
  font-size: 20px;
  font-weight: 800;
  color: ${Pista8Theme.secondary};
  margin: 0;
  line-height: 1.4;
`;

const MetaFoot = styled.p`
  font-size: 13px;
  color: rgba(72,80,84,0.65);
  margin: 6px 0 0;
`;

const MetaError = styled(FieldError)`
  margin-top: 8px;
`;

const MetaBadge = styled.span`
  display: inline-flex;
  margin-top: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  background: ${Pista8Theme.primary}18;
  color: ${Pista8Theme.primary};
  font-size: 11px;
  font-weight: 700;
`;

const Checklist = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ChecklistItem = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 14px;
  background: rgba(255,255,255,0.8);
  border: 1px dashed rgba(72,80,84,0.15);
`;

const StatusDot = styled.span<{ $done: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid ${p => (p.$done ? Pista8Theme.primary : 'rgba(72,80,84,0.25)')};
  background: ${p => (p.$done ? Pista8Theme.primary : 'transparent')};
  transition: background 0.2s ease, border 0.2s ease;
`;

const ChecklistLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${Pista8Theme.secondary};
`;

const FormCard = styled.form`
  background: white;
  border-radius: 28px;
  border: 1px solid rgba(72,80,84,0.08);
  box-shadow: 0 30px 60px rgba(72,80,84,0.12);
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FieldHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const Label = styled.label`
  font-size: 15px;
  font-weight: 700;
  color: ${Pista8Theme.secondary};
  text-transform: none;
`;

const CharCounter = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: rgba(72,80,84,0.5);
`;

const Tip = styled.p`
  font-size: 13px;
  color: rgba(72,80,84,0.65);
  margin: 0;
`;

const FeedbackBanner = styled.div<{ $tone: FeedbackTone }>`
  border-radius: 18px;
  padding: 14px 18px;
  margin-bottom: 12px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  ${({ $tone }) => css`
    border: 1px solid ${FEEDBACK_PALETTE[$tone].border};
    background: ${FEEDBACK_PALETTE[$tone].background};
    color: ${FEEDBACK_PALETTE[$tone].color};
  `}
  p {
    margin: 0;
  }
`;

const BannerGlyph = styled.span`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid currentColor;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  line-height: 1;
`;

const BannerTitle = styled.p`
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 700;
`;

const TextInput = styled.input<{ $invalid?: boolean }>`
  border: 1.5px solid ${p => (p.$invalid ? '#ff8a8a' : 'rgba(72,80,84,0.15)')};
  border-radius: 16px;
  padding: 16px 18px;
  font-size: 15px;
  font-weight: 600;
  color: ${Pista8Theme.secondary};
  transition: border 0.2s ease, box-shadow 0.2s ease;
  ${p => p.$invalid && css`
    box-shadow: 0 0 0 2px rgba(255,138,138,0.2);
  `}
  &:focus {
    outline: none;
    border-color: ${Pista8Theme.primary};
    box-shadow: 0 0 0 3px ${Pista8Theme.primary}25;
  }
`;

const TextArea = styled.textarea<{ $invalid?: boolean }>`
  border: 1.5px solid ${p => (p.$invalid ? '#ff8a8a' : 'rgba(72,80,84,0.15)')};
  border-radius: 18px;
  padding: 18px;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.6;
  resize: vertical;
  color: ${Pista8Theme.secondary};
  transition: border 0.2s ease, box-shadow 0.2s ease;
  ${p => p.$invalid && css`
    box-shadow: 0 0 0 2px rgba(255,138,138,0.2);
  `}
  &:focus {
    outline: none;
    border-color: ${Pista8Theme.primary};
    box-shadow: 0 0 0 3px ${Pista8Theme.primary}25;
  }
`;

const TagCounter = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: rgba(72,80,84,0.5);
`;

const TagInputWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 14px;
  border-radius: 18px;
  border: 1.5px dashed rgba(72,80,84,0.2);
  background: rgba(248,249,250,0.8);
`;

const TagChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  background: ${Pista8Theme.secondary}10;
  color: ${Pista8Theme.secondary};
  font-size: 12px;
  font-weight: 600;
`;

const RemoveTag = styled.button`
  border: none;
  background: transparent;
  color: rgba(72,80,84,0.6);
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 0;
`;

const TagField = styled.input`
  flex: 1;
  min-width: 180px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: ${Pista8Theme.secondary};
  &:focus { outline: none; }
  &:disabled { color: rgba(72,80,84,0.4); }
`;

const AddTagButton = styled.button`
  border: none;
  background: ${Pista8Theme.primary};
  color: white;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.2s ease;
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  &:not(:disabled):hover {
    transform: translateY(-1px);
  }
`;

const ConsentList = styled.div<{ $invalid?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  ${p => p.$invalid && css`
    padding: 12px;
    border-radius: 18px;
    border: 1.5px solid #ff8a8a;
    background: #fff7f7;
  `}
`;

const ConsentItem = styled.label<{ $checked: boolean }>`
  display: flex;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 18px;
  border: 1.5px solid ${p => (p.$checked ? Pista8Theme.primary : 'rgba(72,80,84,0.12)')};
  background: ${p => (p.$checked ? `${Pista8Theme.primary}08` : 'rgba(248,249,250,0.9)')};
  cursor: pointer;
  transition: border 0.2s ease, background 0.2s ease;
`;

const ConsentCheckbox = styled.input`
  width: 20px;
  height: 20px;
  margin-top: 2px;
  accent-color: ${Pista8Theme.primary};
`;

const ConsentTitle = styled.p`
  font-size: 14px;
  font-weight: 700;
  color: ${Pista8Theme.secondary};
  margin: 0 0 2px;
`;

const ConsentDescription = styled.p`
  font-size: 13px;
  color: rgba(72,80,84,0.7);
  margin: 0;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: flex-end;
`;

const GhostButton = styled.button`
  border: 1.5px solid rgba(72,80,84,0.25);
  background: transparent;
  color: ${Pista8Theme.secondary};
  font-weight: 700;
  padding: 14px 18px;
  border-radius: 16px;
  cursor: pointer;
  transition: border 0.2s ease, color 0.2s ease;
  &:hover {
    border-color: ${Pista8Theme.primary};
    color: ${Pista8Theme.primary};
  }
`;

const CTAButton = styled.button`
  border: none;
  background: ${Pista8Theme.primary};
  color: white;
  font-weight: 800;
  padding: 14px 28px;
  border-radius: 18px;
  box-shadow: 0 20px 30px rgba(254,65,10,0.3);
  cursor: pointer;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: transform 0.2s ease, opacity 0.2s ease;
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    box-shadow: none;
  }
  &:not(:disabled):hover {
    transform: translateY(-2px);
  }
`;

const ButtonHint = styled.p`
  text-align: right;
  font-size: 12px;
  color: rgba(72,80,84,0.55);
  margin: -8px 0 0;
`;

const ToastViewport = styled.div`
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 140;
  display: flex;
  flex-direction: column;
  gap: 12px;
  @media (max-width: 640px) {
    left: 16px;
    right: 16px;
  }
`;

const ToastCard = styled.div<{ $tone: FeedbackTone }>`
  min-width: min(340px, calc(100vw - 32px));
  padding: 16px 18px;
  border-radius: 18px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.25);
  ${({ $tone }) => css`
    border: 1px solid ${FEEDBACK_PALETTE[$tone].border};
    background: ${FEEDBACK_PALETTE[$tone].background};
    color: ${FEEDBACK_PALETTE[$tone].color};
  `}
`;

const ToastGlyph = styled(BannerGlyph)`
  width: 28px;
  height: 28px;
`;

const ToastContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  p {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
  }
`;

const ToastTitle = styled.span`
  font-size: 15px;
  font-weight: 700;
`;

const ToastDismiss = styled.button`
  border: none;
  background: transparent;
  color: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 10px;
  transition: background 0.15s ease;
  &:hover {
    background: rgba(255,255,255,0.16);
  }
`;

const ConfirmBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(7,10,13,0.65);
  backdrop-filter: blur(3px);
  z-index: 120;
`;

const ConfirmDialog = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 130;
`;

const ConfirmCard = styled.div`
  width: min(420px, 100%);
  background: white;
  border-radius: 26px;
  padding: 28px 32px;
  border: 1px solid rgba(72,80,84,0.08);
  box-shadow: 0 35px 80px rgba(10,12,15,0.35);
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: ${fadeUp} 0.2s ease both;
`;

const ConfirmTitle = styled.h3`
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: ${Pista8Theme.secondary};
`;

const ConfirmText = styled.p`
  margin: 0;
  font-size: 14px;
  color: rgba(72,80,84,0.75);
  line-height: 1.5;
`;

const ConfirmSummary = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const SummaryPill = styled.span`
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(72,80,84,0.08);
  color: ${Pista8Theme.secondary};
  font-size: 12px;
  font-weight: 600;
`;

const ConfirmActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
  @media (min-width: 420px) {
    flex-direction: row;
  }
`;

const ConfirmGhost = styled(GhostButton)`
  flex: 1;
  width: 100%;
`;

const ConfirmCTA = styled(CTAButton)`
  flex: 1;
  width: 100%;
  text-align: center;
`;

export default IdeationWall;