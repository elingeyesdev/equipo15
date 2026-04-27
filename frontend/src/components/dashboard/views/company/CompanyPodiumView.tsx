import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes, css } from 'styled-components';
import { Pista8Theme } from '../../../../config/theme';
import { challengeService } from '../../../../services/challenge.service';
import { ideaService } from '../../../../services/idea.service';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Trophy, Users, Star, MessageSquare, Heart, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import BackButton from '../../../common/BackButton';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-12px); }
  to { opacity: 1; transform: translateX(0); }
`;

const Container = styled.div`
  animation: ${fadeUp} 0.4s ease both;
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding-bottom: 40px;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 900;
  color: ${Pista8Theme.secondary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  line-height: 1.2;
`;

const ChallengeName = styled.p`
  font-size: 15px;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
  line-height: 1.5;

  strong {
    color: ${Pista8Theme.secondary};
    font-weight: 700;
  }
`;

const ControlCard = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(14px);
  padding: 20px 24px;
  border-radius: 20px;
  border: 1.5px solid rgba(254, 65, 10, 0.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
  flex-wrap: wrap;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 800;
  color: #485054;
  white-space: nowrap;
`;

const Select = styled.select`
  padding: 10px 16px;
  border-radius: 12px;
  border: 1.5px solid #e5e7eb;
  background: white;
  font-size: 13px;
  font-weight: 700;
  color: #374151;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 160px;

  &:focus {
    border-color: ${Pista8Theme.primary};
    box-shadow: 0 0 0 3px rgba(254, 65, 10, 0.1);
  }
`;

const InputNumber = styled.input`
  padding: 10px 16px;
  border-radius: 12px;
  border: 1.5px solid #e5e7eb;
  background: white;
  font-size: 13px;
  font-weight: 700;
  color: #374151;
  outline: none;
  width: 80px;
  text-align: center;
  transition: all 0.2s;

  &:focus {
    border-color: ${Pista8Theme.primary};
    box-shadow: 0 0 0 3px rgba(254, 65, 10, 0.1);
  }
`;

const FinalizeBtn = styled.button`
  padding: 12px 28px;
  border-radius: 14px;
  border: none;
  background: ${Pista8Theme.primary};
  color: white;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(254, 65, 10, 0.3);
  }

  &:disabled {
    background: #e5e7eb;
    color: #9ca3af;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const RankingList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CutOffLine = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 16px 0;
  position: relative;

  &::before, &::after {
    content: '';
    flex: 1;
    border-top: 2px dashed ${Pista8Theme.primary};
    opacity: 0.4;
  }

  span {
    background: ${Pista8Theme.primary};
    color: white;
    font-size: 11px;
    font-weight: 900;
    padding: 4px 14px;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    box-shadow: 0 4px 10px rgba(254, 65, 10, 0.2);
    white-space: nowrap;
  }
`;

const IdeaCard = styled.div<{ $isFinalist: boolean; $rank: number }>`
  background: white;
  padding: 16px 22px;
  border-radius: 16px;
  border: 2px solid ${p => p.$isFinalist ? 'rgba(254, 65, 10, 0.25)' : 'rgba(0,0,0,0.05)'};
  box-shadow: ${p => p.$isFinalist ? '0 4px 18px rgba(254, 65, 10, 0.07)' : '0 1px 6px rgba(0,0,0,0.04)'};
  display: flex;
  align-items: center;
  gap: 18px;
  transition:
    border-color 0.35s ease,
    box-shadow 0.35s ease,
    opacity 0.35s ease,
    filter 0.35s ease,
    transform 0.35s ease;

  ${p => !p.$isFinalist && css`
    filter: grayscale(0.8);
    opacity: 0.55;
    &:hover {
      filter: grayscale(0.3);
      opacity: 0.8;
    }
  `}

  &:hover {
    transform: translateX(6px);
    border-color: ${p => p.$isFinalist ? Pista8Theme.primary : 'rgba(0,0,0,0.12)'};
  }
`;

const AnimatedRow = styled.div<{ $key: string }>`
  animation: ${slideIn} 0.3s ease both;
`;

const RankNumber = styled.div<{ $pos: number }>`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: ${p =>
    p.$pos === 0 ? 'linear-gradient(135deg, #FFD700, #FFA000)' :
    p.$pos === 1 ? 'linear-gradient(135deg, #B0BEC5, #78909C)' :
    p.$pos === 2 ? 'linear-gradient(135deg, #FFAB40, #E65100)' :
    '#f1f3f5'};
  color: ${p => p.$pos < 3 ? 'white' : '#6b7280'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 900;
  flex-shrink: 0;
  box-shadow: ${p => p.$pos < 3 ? '0 4px 10px rgba(0,0,0,0.12)' : 'none'};
  transition: all 0.35s ease;
`;

const IdeaInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
`;

const IdeaTitle = styled.h4`
  font-size: 15px;
  font-weight: 800;
  color: #1a1f22;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const IdeaAuthor = styled.span`
  font-size: 12px;
  color: #9ca3af;
  font-weight: 600;
`;

const Metrics = styled.div`
  display: flex;
  gap: 14px;
  flex-shrink: 0;
`;

const Metric = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 800;
  color: ${p => p.$active ? Pista8Theme.primary : '#9ca3af'};
  transition: color 0.3s ease;

  svg {
    width: 15px;
    height: 15px;
    transition: all 0.3s ease;
  }
`;

const MedalIcon = styled.div`
  color: #fbbf24;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.35s ease;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const Modal = styled.div`
  background: white;
  width: 100%;
  max-width: 480px;
  border-radius: 28px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: ${fadeUp} 0.3s ease both;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
`;

const WarningIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: #fff7ed;
  color: #ea580c;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;

  svg {
    width: 32px;
    height: 32px;
  }
`;

const ModalContent = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 900;
  color: #1e293b;
  margin: 0;
`;

const ModalText = styled.p`
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;

  button {
    flex: 1;
    padding: 14px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s;
  }
`;

const CancelBtn = styled.button`
  background: #f1f3f5;
  color: #475569;
  border: none;
  &:hover { background: #e2e8f0; }
`;

const ConfirmBtn = styled.button`
  background: ${Pista8Theme.primary};
  color: white;
  border: none;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(254, 65, 10, 0.3);
  }
  &:disabled {
    background: #e5e7eb;
    color: #9ca3af;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const SkeletonCard = styled.div`
  height: 76px;
  background: linear-gradient(90deg, #f1f3f5 25%, #e5e7eb 50%, #f1f3f5 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 16px;
`;

const PickChallengeView = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 60px 20px;
  text-align: center;
  align-items: center;
`;

const PickTitle = styled.h2`
  font-size: 22px;
  font-weight: 900;
  color: ${Pista8Theme.secondary};
  margin: 0;
`;

const PickText = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  max-width: 380px;
  line-height: 1.6;
`;

const FinalistCountBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(254, 65, 10, 0.08);
  color: ${Pista8Theme.primary};
  font-size: 12px;
  font-weight: 800;
  border: 1px solid rgba(254, 65, 10, 0.15);
  align-self: center;
`;

const EvaluationBanner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 24px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(22, 163, 74, 0.08), rgba(22, 163, 74, 0.04));
  border: 1.5px solid rgba(22, 163, 74, 0.25);
  animation: ${fadeUp} 0.4s ease both;
`;

const BannerIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(22, 163, 74, 0.12);
  color: #16a34a;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg { width: 22px; height: 22px; }
`;

const BannerContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const BannerTitle = styled.p`
  font-size: 14px;
  font-weight: 900;
  color: #15803d;
  margin: 0;
`;

const BannerText = styled.p`
  font-size: 13px;
  color: #4b7c59;
  margin: 0;
  line-height: 1.55;
`;

export const CompanyPodiumView = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const challengeId = searchParams.get('challengeId');

  const [challenge, setChallenge] = useState<any>(null);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<'likes' | 'comments' | 'votes'>('likes');
  const [limit, setLimit] = useState<string>('5');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const prevMetric = useRef(metric);
  const prevLimit = useRef(limit);

  const fetchData = useCallback(async () => {
    if (!challengeId) return;
    setLoading(true);
    try {
      const [challengeRes, ideasRes] = await Promise.all([
        challengeService.getChallengeById(challengeId),
        ideaService.getIdeasByChallenge(challengeId)
      ]);
      const rawIdeas = (ideasRes as any);
      let resolvedIdeas: any[] = [];
      if (Array.isArray(rawIdeas)) {
        resolvedIdeas = rawIdeas;
      } else if (Array.isArray(rawIdeas?.data?.data)) {
        resolvedIdeas = rawIdeas.data.data;
      } else if (Array.isArray(rawIdeas?.data)) {
        resolvedIdeas = rawIdeas.data;
      } else if (Array.isArray(rawIdeas?.data?.ideas)) {
        resolvedIdeas = rawIdeas.data.ideas;
      }
      setChallenge((challengeRes as any).data ?? challengeRes);
      setIdeas(resolvedIdeas);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('No se pudo cargar la información del reto.');
    } finally {
      setLoading(false);
    }
  }, [challengeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (prevMetric.current !== metric || prevLimit.current !== limit) {
      setAnimKey(k => k + 1);
      prevMetric.current = metric;
      prevLimit.current = limit;
    }
  }, [metric, limit]);

  const sortedIdeas = useMemo(() => {
    const safeIdeas = Array.isArray(ideas) ? ideas : [];
    return [...safeIdeas].sort((a, b) => {
      if (metric === 'likes') return (b.likesCount || 0) - (a.likesCount || 0);
      if (metric === 'comments') return (b.commentsCount || 0) - (a.commentsCount || 0);
      if (metric === 'votes') return (b.votesCount || 0) - (a.votesCount || 0);
      return 0;
    });
  }, [ideas, metric]);

  const handleFinalize = async () => {
    if (!challengeId) return;
    setIsFinalizing(true);
    try {
      await challengeService.finalizePodium(challengeId, {
        category: metric,
        limit: safeLimit
      });
      toast.success('¡Podio finalizado con éxito! El reto ha pasado a evaluación.');
      navigate('/dashboard/company/challenges');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al finalizar el podio.');
    } finally {
      setIsFinalizing(false);
      setShowConfirm(false);
    }
  };

  if (!challengeId) {
    return (
      <PickChallengeView>
        <WarningIcon><Trophy /></WarningIcon>
        <PickTitle>Gestión de Podio</PickTitle>
        <PickText>Accede a esta vista desde un reto finalizado en "Mis Retos" para gestionar su podio y finalistas.</PickText>
        <BackButton onClick={() => navigate('/dashboard/company/challenges')} />
      </PickChallengeView>
    );
  }

  if (loading) {
    return (
      <Container>
        <Header>
          <TitleRow>
            <BackButton onClick={() => navigate('/dashboard/company/challenges')} />
            <TitleBlock>
              <Title><Trophy /> Gestión de Podio</Title>
            </TitleBlock>
          </TitleRow>
        </Header>
        <RankingList>
          {[1, 2, 3, 4, 5].map(i => <SkeletonCard key={i} />)}
        </RankingList>
      </Container>
    );
  }

  const isAlreadyEvaluated = challenge?.status === 'EVALUATION' || challenge?.status === 'Finalizado';
  const parsedLimit = parseInt(limit, 10);
  const safeLimit = isNaN(parsedLimit) || parsedLimit < 1
    ? 0
    : Math.min(parsedLimit, sortedIdeas.length);
  const canSend = safeLimit > 0 && !isAlreadyEvaluated && ideas.length > 0;

  return (
    <>
      <Container>
        <Header>
          <TitleRow>
            <BackButton onClick={() => navigate('/dashboard/company/challenges')} />
            <TitleBlock>
              <Title><Trophy /> Gestión de Podio</Title>
              <ChallengeName>
                Reto: <strong>{challenge?.title}</strong>
              </ChallengeName>
            </TitleBlock>
          </TitleRow>
        </Header>

        {isAlreadyEvaluated && (
          <EvaluationBanner>
            <BannerIcon><CheckCircle /></BannerIcon>
            <BannerContent>
              <BannerTitle>Podio Consolidado — Fase de Evaluación Activa</BannerTitle>
              <BannerText>
                El podio ha sido enviado. Las ideas seleccionadas ya están en manos de los jueces para su evaluación técnica. No se pueden realizar cambios.
              </BannerText>
            </BannerContent>
          </EvaluationBanner>
        )}

        <ControlCard>
          <ControlGroup>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Label>Métrica:</Label>
              <Select value={metric} onChange={(e) => setMetric(e.target.value as any)} disabled={isAlreadyEvaluated}>
                <option value="likes">Por Likes</option>
                <option value="comments">Por Comentarios</option>
                <option value="votes">Por Votos</option>
              </Select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Label>Top Finalistas:</Label>
              <InputNumber
                type="number"
                min="1"
                max={ideas.length}
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                onBlur={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v) && v > 0) setLimit(String(Math.min(v, ideas.length)));
                }}
                disabled={isAlreadyEvaluated}
                placeholder="#"
              />
            </div>
            {sortedIdeas.length > 0 && (
              <FinalistCountBadge>
                {safeLimit > 0 ? safeLimit : '—'} / {sortedIdeas.length} seleccionadas
              </FinalistCountBadge>
            )}
          </ControlGroup>

          <FinalizeBtn
            onClick={() => !isAlreadyEvaluated && setShowConfirm(true)}
            disabled={!canSend}
            style={isAlreadyEvaluated ? {
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              cursor: 'not-allowed',
              boxShadow: '0 4px 14px rgba(22, 163, 74, 0.25)'
            } : {}}
          >
            {isAlreadyEvaluated ? (
              <><CheckCircle size={18} /> Podio Enviado</>  
            ) : (
              <><Users size={18} /> Enviar a Jueces</>
            )}
          </FinalizeBtn>
        </ControlCard>

        <RankingList>
          {sortedIdeas.map((idea, index) => {
            const isFinalist = index < safeLimit;
            const isCutOff = index === safeLimit;

            return (
              <AnimatedRow key={`${animKey}-${idea.id}`} $key={`${animKey}-${index}`} style={{ animationDelay: `${index * 0.04}s` }}>
                {isCutOff && (
                  <CutOffLine>
                    <span>Punto de Corte</span>
                  </CutOffLine>
                )}
                <IdeaCard $isFinalist={isFinalist} $rank={index}>
                  <RankNumber $pos={index}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </RankNumber>
                  <IdeaInfo>
                    <IdeaTitle>{idea.title}</IdeaTitle>
                    <IdeaAuthor>Por {idea.author?.nickname || idea.author?.displayName || 'Participante'}</IdeaAuthor>
                  </IdeaInfo>
                  <Metrics>
                    <Metric $active={metric === 'likes'}>
                      <Heart fill={metric === 'likes' ? Pista8Theme.primary : 'none'} /> {idea.likesCount || 0}
                    </Metric>
                    <Metric $active={metric === 'comments'}>
                      <MessageSquare fill={metric === 'comments' ? Pista8Theme.primary : 'none'} /> {idea.commentsCount || 0}
                    </Metric>
                    <Metric $active={metric === 'votes'}>
                      <Star fill={metric === 'votes' ? Pista8Theme.primary : 'none'} /> {idea.votesCount || 0}
                    </Metric>
                  </Metrics>
                  {isFinalist && (
                    <MedalIcon>
                      <Star size={22} fill="#fbbf24" stroke="#fbbf24" />
                    </MedalIcon>
                  )}
                </IdeaCard>
              </AnimatedRow>
            );
          })}
        </RankingList>
      </Container>

      {showConfirm && createPortal(
        <ModalOverlay onClick={() => setShowConfirm(false)}>
          <Modal onClick={e => e.stopPropagation()}>
            <WarningIcon><AlertTriangle /></WarningIcon>
            <ModalContent>
              <ModalTitle>¿Confirmar Podio Final?</ModalTitle>
              <ModalText>
                Esta acción cerrará las votaciones públicas y notificará a los jueces.
                Se seleccionarán los primeros <strong>{safeLimit}</strong> participantes según el criterio de <strong>{metric === 'likes' ? 'Likes' : metric === 'comments' ? 'Comentarios' : 'Votos'}</strong>.
                <br /><br />
                <strong>Esta acción es irreversible.</strong>
              </ModalText>
            </ModalContent>
            <ModalActions>
              <CancelBtn onClick={() => setShowConfirm(false)}>Cancelar</CancelBtn>
              <ConfirmBtn onClick={handleFinalize} disabled={isFinalizing}>
                {isFinalizing ? 'Procesando...' : 'Sí, Enviar a Jueces'}
              </ConfirmBtn>
            </ModalActions>
          </Modal>
        </ModalOverlay>,
        document.body
      )}
    </>
  );
};
