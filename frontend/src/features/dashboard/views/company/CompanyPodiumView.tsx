import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes, css } from 'styled-components';
import { Pista8Theme, breakpoints } from '../../../../config/theme';
import { challengeService } from '../../../../services/challenge.service';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import { Trophy, Users, MessageSquare, Sparkles, AlertTriangle, CheckCircle, Loader2, Gavel, Calculator, Clock, Download, FileSpreadsheet } from 'lucide-react';
import { generatePodiumPDF } from '../../../../utils/generatePodiumPDF';
import MedalSvg from '../../../../components/icons/MedalSvg';
import { toast } from 'sonner';
import BackButton from '../../../../components/common/BackButton';
import InfoTooltip from '../../../../components/common/InfoTooltip';
import { EvaluationScoresModal } from '../../components/EvaluationScoresModal';
import { premiumTooltip } from '../../styles/CommonStyles';

const TIEBREAK_TOOLTIP =
  'Desempate automático aplicado a favor de la idea postulada con mayor antigüedad.';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
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

  @media (max-width: ${breakpoints.mobile}) {
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
const IdeaCard = styled.div<{ 
  $isFinalist: boolean; 
  $rank: number; 
  $clickable?: boolean;
  $tooltipText?: string;
  $tooltipPosition?: 'top' | 'bottom';
  $tooltipAlign?: 'center' | 'right';
}>`
  ${premiumTooltip}
  background: white;
  padding: 16px 22px;
  border-radius: 16px;
  border: 2px solid ${p => p.$isFinalist ? 'rgba(254, 65, 10, 0.25)' : 'rgba(0,0,0,0.05)'};
  box-shadow: ${p => p.$isFinalist ? '0 4px 18px rgba(254, 65, 10, 0.07)' : '0 1px 6px rgba(0,0,0,0.04)'};
  display: flex;
  align-items: center;
  gap: 18px;
  cursor: ${p => p.$clickable ? 'pointer' : 'default'};
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
    z-index: 200;
  }

  @media (max-width: ${breakpoints.mobile}) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;

    &:hover {
      transform: translateY(-4px);
    }
  }
`;

const AnimatedRow = styled.div<{ $key: string }>`
  animation: ${slideIn} 0.3s ease both;
  position: relative;
  &:hover {
    z-index: 10;
  }
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

const ScoreMetric = styled(Metric)`
  gap: 6px;
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

const ExportBtnWrapper = styled.div<{ 
  $color: string;
  $tooltipText?: string;
  $tooltipPosition?: 'top' | 'bottom';
  $tooltipAlign?: 'center' | 'right';
}>`
  ${premiumTooltip}
  
  .Btn {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 45px;
    height: 45px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition-duration: .3s;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.199);
    background-color: ${p => p.$color};
  }

  .sign {
    width: 100%;
    transition-duration: .3s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sign svg {
    width: 18px;
    height: 18px;
    color: white;
  }

  .text {
    position: absolute;
    right: 0%;
    width: 0%;
    opacity: 0;
    color: white;
    font-size: 0.95em;
    font-weight: 600;
    transition-duration: .3s;
    white-space: nowrap;
  }

  .Btn:hover {
    width: 180px;
    border-radius: 40px;
    transition-duration: .3s;
  }

  .Btn:hover .sign {
    width: 30%;
    transition-duration: .3s;
    padding-left: 15px;
  }

  .Btn:hover .text {
    opacity: 1;
    width: 70%;
    transition-duration: .3s;
    padding-right: 15px;
  }

  .Btn:active {
    transform: translate(2px ,2px);
  }

  .Btn:disabled {
    background-color: #cdd3d8;
    cursor: not-allowed;
    box-shadow: none;
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

const ProcessingState = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(254, 65, 10, 0.08);
  border: 1px solid rgba(254, 65, 10, 0.16);
  color: ${Pista8Theme.primary};
  font-size: 13px;
  font-weight: 800;
  line-height: 1.4;

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    animation: ${spin} 0.9s linear infinite;
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
  animation: ${fadeUp} 0.4s ease both;
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

const GoBackBtn = styled.button`
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  background: ${Pista8Theme.primary};
  color: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #e63a09;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(254,65,10,0.25);
  }
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
  background: linear-gradient(135deg, rgba(254, 65, 10, 0.08), rgba(254, 65, 10, 0.03));
  border: 1.5px solid rgba(254, 65, 10, 0.18);
  animation: ${fadeUp} 0.4s ease both;
`;

const BannerIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(254, 65, 10, 0.12);
  color: #FE410A;
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
  color: #d93809;
  margin: 0;
`;

const BannerText = styled.p`
  font-size: 13px;
  color: #8c2406;
  margin: 0;
  line-height: 1.55;
`;

const Stepper = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  padding: 4px 0 8px;
  overflow-x: auto;

  @media (max-width: ${breakpoints.mobile}) {
    padding-bottom: 4px;
  }
`;

const StepItem = styled.div<{ $active: boolean; $done: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;

  &:last-child {
    flex: 0 0 auto;
  }
`;

const StepCircle = styled.div<{ $active: boolean; $done: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 900;
  transition: all 0.25s ease;
  background: ${p =>
    p.$done ? '#16a34a' :
    p.$active ? Pista8Theme.primary :
    '#e5e7eb'};
  color: ${p => (p.$done || p.$active) ? 'white' : '#9ca3af'};
  box-shadow: ${p => p.$active ? '0 4px 14px rgba(254, 65, 10, 0.25)' : 'none'};
`;

const StepLabel = styled.div<{ $active: boolean; $done: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;

  strong {
    font-size: 12px;
    font-weight: 900;
    color: ${p => p.$active ? Pista8Theme.secondary : p.$done ? '#15803d' : '#9ca3af'};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span {
    font-size: 11px;
    color: #9ca3af;
    line-height: 1.3;
  }
`;

const StepConnector = styled.div<{ $done: boolean }>`
  flex: 1;
  height: 2px;
  min-width: 24px;
  margin: 0 8px;
  background: ${p => p.$done ? '#16a34a' : '#e5e7eb'};
  transition: background 0.25s ease;
`;

const ProgressCard = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-radius: 16px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.22);
  color: #92400e;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.45;

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
`;

const PendingBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(245, 158, 11, 0.12);
  color: #b45309;
  font-size: 11px;
  font-weight: 800;
`;

type PodiumPhase = 'select' | 'evaluate' | 'publish' | 'done';

type PodiumStatus = {
  phase: 'SELECT_FINALISTS' | 'AWAITING_JUDGES' | 'COMPLETED';
  evaluationCount: number;
  assignedJudgesCount: number;
  ideasWithEvaluations: number;
  finalistCount: number;
  winnerCount: number;
  canGenerateResults: boolean;
  podiumSize: number | null;
};

const resolvePhase = (status?: string, podiumPhase?: string): PodiumPhase => {
  if (status === 'CLOSED') return 'done';
  if (podiumPhase === 'AWAITING_JUDGES') return 'evaluate';
  if (podiumPhase === 'SELECT_FINALISTS') return 'select';
  if (status === 'EVALUATING') return 'evaluate';
  return 'select';
};



export const CompanyPodiumView = () => {
  const { impersonationSession } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const challengeId = searchParams.get('challengeId');

  const [challenge, setChallenge] = useState<any>(null);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [podiumStatus, setPodiumStatus] = useState<PodiumStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [cutLimit, setCutLimit] = useState<string>('5');
  const [metric, setMetric] = useState<string>('fireScore');
  const [showConfirm, setShowConfirm] = useState(false);
  const [scoresModalIdea, setScoresModalIdea] = useState<{ id: string; title: string } | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const fetchData = useCallback(async () => {
    if (!challengeId) return;
    setLoading(true);
    try {
      const [challengeRes, ideasRes, statusRes] = await Promise.all([
        challengeService.getChallengeById(challengeId),
        challengeService.getPodiumIdeas(challengeId).catch(() => []),
        challengeService.getPodiumStatus(challengeId).catch(() => null),
      ]);
      const resolvedIdeas = Array.isArray(ideasRes) ? ideasRes : [];
      const resolvedChallenge = (challengeRes as any).data ?? challengeRes;
      setChallenge(resolvedChallenge);
      setIdeas(resolvedIdeas);
      setPodiumStatus(statusRes);
      if (resolvedChallenge?.podiumSize) {
        setCutLimit(String(resolvedChallenge.podiumSize));
      }
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
    setAnimKey(k => k + 1);
  }, [cutLimit, metric]);

  const phase = resolvePhase(challenge?.status, podiumStatus?.phase);
  const readOnlyMode = Boolean(impersonationSession);

  const visibleIdeas = useMemo(() => {
    const safeIdeas = Array.isArray(ideas) ? ideas : [];
    if (phase === 'evaluate') {
      const finalists = safeIdeas.filter(i => i.status === 'FINALIST');
      return finalists.length > 0 ? finalists : safeIdeas;
    }
    if (phase === 'done') {
      const winners = safeIdeas.filter(i => i.status === 'WINNER');
      return winners.length > 0 ? winners : safeIdeas;
    }
    return safeIdeas;
  }, [ideas, phase]);

  const sortedIdeas = useMemo(() => {
    return [...visibleIdeas].sort((a, b) => {
      if (phase === 'evaluate' || phase === 'done') {
        const scoreDiff = (b.finalScore || 0) - (a.finalScore || 0);
        if (scoreDiff !== 0) return scoreDiff;
        const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return aCreated - bCreated;
      }
      if (metric === 'fireScore') {
        return (b.fireScore || b.likesCount || 0) - (a.fireScore || a.likesCount || 0);
      }
      return (b.commentsCount || 0) - (a.commentsCount || 0);
    });
  }, [visibleIdeas, metric, phase]);

  const tieBreakAtPodium = useMemo(() => {
    if (phase !== 'done' || sortedIdeas.length < 2) return false;
    const firstScore = sortedIdeas[0]?.finalScore ?? 0;
    const secondScore = sortedIdeas[1]?.finalScore ?? 0;
    return firstScore > 0 && firstScore === secondScore;
  }, [phase, sortedIdeas]);

  const filteredIdeas = useMemo(() => {
    const limit = parseInt(cutLimit, 10);
    return limit > 0 ? sortedIdeas.slice(0, limit) : sortedIdeas;
  }, [sortedIdeas, cutLimit]);

  const actionLimit = useMemo(() => {
    const parsedCut = parseInt(cutLimit, 10);
    if (parsedCut > 0) {
      return Math.min(parsedCut, sortedIdeas.length);
    }
    return sortedIdeas.length;
  }, [cutLimit, sortedIdeas.length]);

  const handleSendToJudges = async () => {
    if (!challengeId || readOnlyMode) return;
    setIsFinalizing(true);
    try {
      await challengeService.finalizePodium(challengeId, {
        category: metric === 'fireScore' ? 'likes' : 'comments',
        limit: actionLimit,
      });
      toast.success('Finalistas enviados a jueces. Ahora pueden evaluar las ideas.');
      await fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al enviar finalistas a jueces.');
    } finally {
      setIsFinalizing(false);
      setShowConfirm(false);
    }
  };

  const handleGenerateResults = async () => {
    if (!challengeId || readOnlyMode) return;
    setIsFinalizing(true);
    try {
      await challengeService.finalizePodium(challengeId, {
        category: 'votes',
        limit: actionLimit,
      });
      toast.success('¡Podio finalizado! Los puntajes técnicos fueron calculados.');
      await fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al calcular puntajes y finalizar el podio.');
    } finally {
      setIsFinalizing(false);
      setShowConfirm(false);
    }
  };

  const handleConfirm = () => {
    if (phase === 'select') return handleSendToJudges();
    if (phase === 'evaluate') return handleGenerateResults();
  };

  const handleDownloadPDF = async () => {
    if (!challenge || isDownloadingPDF) return;
    setIsDownloadingPDF(true);
    try {
      const topWinners = sortedIdeas.slice(0, 3);
      generatePodiumPDF(challenge, topWinners);
      toast.success('Reporte ejecutivo generado y descargado.');
    } catch (err) {
      console.error('Error generando PDF:', err);
      toast.error('No se pudo generar el reporte. Intenta de nuevo.');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleDownloadExcel = async () => {
    if (!challengeId || isDownloadingExcel) return;
    setIsDownloadingExcel(true);
    try {
      await challengeService.downloadEvaluationExcel(challengeId);
      toast.success('Reporte Excel descargado exitosamente.');
    } catch (err) {
      console.error('Error descargando Excel:', err);
      toast.error('No se pudo descargar el reporte Excel.');
    } finally {
      setIsDownloadingExcel(false);
    }
  };

  const handleCloseChallenge = async () => {
    if (!challengeId || isClosing) return;
    setIsClosing(true);
    try {
      await challengeService.closeChallenge(challengeId);
      toast.success('Resultados publicados', { description: 'El reto ha sido cerrado y los resultados son públicos.' });
      setShowConfirmClose(false);
      await fetchData();
    } catch (err: any) {
      console.error('Error cerrando reto:', err);
      toast.error('No se pudo publicar los resultados.', { description: err.message });
    } finally {
      setIsClosing(false);
    }
  };

  if (!challengeId) {
    return (
      <PickChallengeView>
        <WarningIcon><Trophy /></WarningIcon>
        <PickTitle>Gestión de Podio</PickTitle>
        <PickText>Accede a esta vista desde un reto finalizado en "Mis Retos" para gestionar su podio y finalistas.</PickText>
        <GoBackBtn onClick={() => navigate('/dashboard/company/challenges')}>
          Ir a Mis Retos
        </GoBackBtn>
      </PickChallengeView>
    );
  }

  if (loading) {
    return (
      <Container>
        <Header>
          <TitleRow>
            <BackButton />
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

  const isCompleted = phase === 'done';
  const canSendToJudges = phase === 'select' && actionLimit > 0 && !readOnlyMode && ideas.length > 0;
  const isResultsGenerated = (podiumStatus?.winnerCount || 0) > 0;
  const effectivePhase: PodiumPhase = phase === 'evaluate' && isResultsGenerated ? 'publish' : phase;
  const canGenerateResults = effectivePhase === 'evaluate' && !readOnlyMode && Boolean(podiumStatus?.canGenerateResults) && actionLimit > 0;

  const stepIndex = effectivePhase === 'select' ? 0 : effectivePhase === 'evaluate' ? 1 : effectivePhase === 'publish' ? 2 : 3;

  const cutLabel = phase === 'select'
    ? 'Finalistas a enviar'
    : phase === 'evaluate'
      ? 'Ganadores a declarar'
      : 'Podio final';

  const processingMessage = phase === 'select'
    ? 'Preparando lote de finalistas para los jueces...'
    : 'Procesando rúbricas y calculando puntajes...';

  const hasMissingEvaluations = (podiumStatus?.ideasWithEvaluations || 0) < (podiumStatus?.finalistCount || 0);

  let confirmTitle = '';
  let confirmText = '';

  if (phase === 'select') {
    confirmTitle = '¿Enviar finalistas a jueces?';
    confirmText = 'Se cerrará la participación pública y se enviarán ' + actionLimit + ' ideas a los jueces para evaluación técnica. Esta acción es irreversible.';
  } else if (phase === 'evaluate') {
    if (hasMissingEvaluations) {
      const missingCount = (podiumStatus?.finalistCount || 0) - (podiumStatus?.ideasWithEvaluations || 0);
      confirmTitle = '⚠️ Evaluaciones Incompletas';
      confirmText = 'Aún faltan ' + missingCount + ' ideas por evaluar por parte del panel de jueces. Si decides forzar el cálculo ahora, el algoritmo promediará las notas utilizando únicamente las evaluaciones que ya han sido enviadas. Los jueces rezagados perderán el acceso para calificar. ¿Deseas proceder?';
    } else {
      confirmTitle = '¿Calcular puntajes y finalizar podio?';
      confirmText = 'Se calcularán los puntajes técnicos con las rúbricas recibidas y se declararán ' + actionLimit + ' ganador' + (actionLimit !== 1 ? 'es' : '') + '. Esta acción es irreversible.';
    }
  }

  const confirmButtonLabel = phase === 'select'
    ? (isFinalizing ? 'Enviando...' : 'Sí, enviar a jueces')
    : (isFinalizing ? 'Calculando...' : hasMissingEvaluations ? 'Sí, forzar cálculo' : 'Sí, finalizar podio');

  return (
    <>
      <Container>
        <Header>
          <TitleRow>
            <BackButton />
            <TitleBlock>
              <Title><Trophy /> Gestión de Podio</Title>
              <ChallengeName>
                Reto: <strong>{challenge?.title}</strong>
              </ChallengeName>
            </TitleBlock>
          </TitleRow>

          <Stepper>
            <StepItem $active={stepIndex === 0} $done={stepIndex > 0}>
              <StepCircle $active={stepIndex === 0} $done={stepIndex > 0}>
                {stepIndex > 0 ? <CheckCircle size={16} /> : '1'}
              </StepCircle>
              <StepLabel $active={stepIndex === 0} $done={stepIndex > 0}>
                <strong>Seleccionar finalistas</strong>
                <span>Por interacción social</span>
              </StepLabel>
            </StepItem>
            <StepConnector $done={stepIndex > 0} />
            <StepItem $active={stepIndex === 1} $done={stepIndex > 1}>
              <StepCircle $active={stepIndex === 1} $done={stepIndex > 1}>
                {stepIndex > 1 ? <CheckCircle size={16} /> : '2'}
              </StepCircle>
              <StepLabel $active={stepIndex === 1} $done={stepIndex > 1}>
                <strong>Evaluación de jueces</strong>
                <span>Rúbricas técnicas</span>
              </StepLabel>
            </StepItem>
            <StepConnector $done={stepIndex > 1} />
            <StepItem $active={stepIndex === 2} $done={stepIndex > 2}>
              <StepCircle $active={stepIndex === 2} $done={stepIndex > 2}>
                {stepIndex > 2 ? <CheckCircle size={16} /> : '3'}
              </StepCircle>
              <StepLabel $active={stepIndex === 2} $done={stepIndex > 2}>
                <strong>Publicación de resultados</strong>
                <span>Declarar ganadores</span>
              </StepLabel>
            </StepItem>
            <StepConnector $done={stepIndex > 2} />
            <StepItem $active={stepIndex === 3} $done={false}>
              <StepCircle $active={stepIndex === 3} $done={false}>4</StepCircle>
              <StepLabel $active={stepIndex === 3} $done={false}>
                <strong>Podio final</strong>
                <span>Puntajes consolidados</span>
              </StepLabel>
            </StepItem>
          </Stepper>
        </Header>

        {phase === 'select' && (
          <EvaluationBanner>
            <BannerIcon>
              <Users />
            </BannerIcon>
            <BannerContent>
              <BannerTitle>Paso 1 — Elige quién pasa a la ronda de jueces</BannerTitle>
              <BannerText>
                Ordena las ideas por destellos o comentarios y define cuántas avanzan. Los puntajes técnicos se calculan recién después de que los jueces evalúen.
              </BannerText>
            </BannerContent>
          </EvaluationBanner>
        )}

        {effectivePhase === 'evaluate' && (
          <>
            <EvaluationBanner>
              <BannerIcon><Gavel /></BannerIcon>
              <BannerContent>
                <BannerTitle>Finalistas en evaluación — Paso 2</BannerTitle>
                <BannerText>
                  Las ideas ya están con los jueces. Cuando reciban evaluaciones, podrás calcular los puntajes técnicos y declarar el podio final.
                </BannerText>
              </BannerContent>
            </EvaluationBanner>
            {podiumStatus && (
              <ProgressCard>
                <Clock />
                <span>
                  {podiumStatus.assignedJudgesCount} juez{podiumStatus.assignedJudgesCount !== 1 ? 'es' : ''} asignado{podiumStatus.assignedJudgesCount !== 1 ? 's' : ''}
                  {' · '}
                  {podiumStatus.evaluationCount} evaluación{podiumStatus.evaluationCount !== 1 ? 'es' : ''} recibida{podiumStatus.evaluationCount !== 1 ? 's' : ''}
                  {' · '}
                  {podiumStatus.ideasWithEvaluations} de {podiumStatus.finalistCount || filteredIdeas.length} idea{(podiumStatus.finalistCount || filteredIdeas.length) !== 1 ? 's' : ''} evaluada{(podiumStatus.finalistCount || filteredIdeas.length) !== 1 ? 's' : ''}
                </span>
              </ProgressCard>
            )}
          </>
        )}

        {effectivePhase === 'publish' && (
          <EvaluationBanner>
            <BannerIcon><Trophy /></BannerIcon>
            <BannerContent>
              <BannerTitle>Publicación de resultados — Paso 3</BannerTitle>
              <BannerText>
                Los puntajes técnicos han sido calculados. Revisa el ranking y cuando estés listo, publica los resultados para cerrar el reto.
              </BannerText>
            </BannerContent>
          </EvaluationBanner>
        )}

        {phase === 'done' && (
          <EvaluationBanner>
            <BannerIcon><CheckCircle /></BannerIcon>
            <BannerContent>
              <BannerTitle>Podio finalizado — Reto cerrado</BannerTitle>
              <BannerText>
                Los puntajes técnicos fueron calculados y los ganadores declarados.
                {tieBreakAtPodium && (
                  <> El desempate entre el 1° y 2° puesto se resolvió por antigüedad de postulación.</>
                )}
                {' '}Esta vista es de solo lectura.
              </BannerText>
            </BannerContent>
          </EvaluationBanner>
        )}

        <ControlCard>
          <ControlGroup>
            {!isCompleted && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Label>{cutLabel}:</Label>
                <Select value={cutLimit} onChange={(e) => setCutLimit(e.target.value)} disabled={isCompleted || readOnlyMode}>
                  <option value="0">Todos</option>
                  <option value="3">Top 3</option>
                  <option value="5">Top 5</option>
                  <option value="10">Top 10</option>
                  <option value="15">Top 15</option>
                  <option value="20">Top 20</option>
                </Select>
              </div>
            )}
            {phase === 'select' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Label>Ordenar por:</Label>
                <Select value={metric} onChange={(e) => setMetric(e.target.value)} disabled={readOnlyMode}>
                  <option value="fireScore">Mayor interacción social (Destellos)</option>
                  <option value="comments">Más comentarios / Retroalimentación</option>
                </Select>
              </div>
            )}
            {filteredIdeas.length > 0 && !isCompleted && (
              <FinalistCountBadge>
                {filteredIdeas.length} / {sortedIdeas.length} seleccionadas
              </FinalistCountBadge>
            )}
          </ControlGroup>

          {phase === 'select' && (
            <FinalizeBtn
              onClick={() => !readOnlyMode && setShowConfirm(true)}
              disabled={!canSendToJudges}
            >
              <Users size={18} />
              {readOnlyMode ? 'Estás en modo lectura ahora' : 'Enviar finalistas a jueces'}
            </FinalizeBtn>
          )}

          {effectivePhase === 'evaluate' && (
            <FinalizeBtn
              onClick={() => !readOnlyMode && podiumStatus?.canGenerateResults && setShowConfirm(true)}
              disabled={!canGenerateResults}
              title={!podiumStatus?.canGenerateResults ? 'Espera a que los jueces envíen al menos una evaluación' : undefined}
            >
              <Calculator size={18} />
              {readOnlyMode ? 'Estás en modo lectura ahora' : 'Calcular puntajes y visualizar podio'}
            </FinalizeBtn>
          )}

          {effectivePhase === 'publish' && (
            <FinalizeBtn
              onClick={() => !readOnlyMode && setShowConfirmClose(true)}
            >
              <Trophy size={18} />
              {readOnlyMode ? 'Estás en modo lectura ahora' : 'Publicar Resultados'}
            </FinalizeBtn>
          )}

          {phase === 'done' && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              {challenge?.status === 'CLOSED' ? (
                <FinalizeBtn disabled style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', cursor: 'not-allowed', boxShadow: '0 4px 14px rgba(22, 163, 74, 0.25)' }}>
                  <CheckCircle size={18} /> Podio finalizado
                </FinalizeBtn>
              ) : (
                <FinalizeBtn 
                  onClick={() => !readOnlyMode && setShowConfirmClose(true)}
                  disabled={isClosing || readOnlyMode}
                >
                  <Trophy size={18} /> {isClosing ? 'Publicando...' : 'Publicar Resultados'}
                </FinalizeBtn>
              )}
              <ExportBtnWrapper 
                $color="#E93131"
                data-tooltip="Descargar reporte ejecutivo en PDF"
                data-tooltip-position="top"
              >
                <button 
                  className="Btn" 
                  onClick={handleDownloadPDF} 
                  disabled={isDownloadingPDF}
                >
                  <div className="sign">
                    {isDownloadingPDF ? <Loader2 style={{ animation: 'spin 0.9s linear infinite' }} /> : <Download />}
                  </div>
                  <div className="text">Exportar a PDF</div>
                </button>
              </ExportBtnWrapper>

              <ExportBtnWrapper 
                $color="#1F613D"
                data-tooltip="Descargar datos crudos de evaluaciones en Excel"
                data-tooltip-position="top"
              >
                <button 
                  className="Btn" 
                  onClick={handleDownloadExcel} 
                  disabled={isDownloadingExcel}
                >
                  <div className="sign">
                    {isDownloadingExcel ? <Loader2 style={{ animation: 'spin 0.9s linear infinite' }} /> : <FileSpreadsheet />}
                  </div>
                  <div className="text">Exportar a Excel</div>
                </button>
              </ExportBtnWrapper>
            </div>
          )}
        </ControlCard>

        <RankingList>
          {filteredIdeas.map((idea, index) => {
            const showPendingScore = phase === 'evaluate' && !(idea.finalScore > 0);
            const rankIndex =
              phase === 'done' && idea.podiumPosition != null
                ? idea.podiumPosition - 1
                : index;
            const showTieBreakInfo =
              phase === 'done' && tieBreakAtPodium && rankIndex === 0;
            const canOpenBreakdown = phase === 'evaluate' || phase === 'done';
            return (
              <AnimatedRow key={`${animKey}-${idea.id}`} $key={`${animKey}-${index}`} style={{ animationDelay: `${index * 0.04}s` }}>
                <IdeaCard
                  $isFinalist={cutLimit !== '0' || phase !== 'select'}
                  $rank={rankIndex}
                  $clickable={canOpenBreakdown}
                  onClick={() => canOpenBreakdown && setScoresModalIdea({ id: idea.id, title: idea.title })}
                  $tooltipText={canOpenBreakdown ? 'Ver desglose de evaluaciones' : undefined}
                  $tooltipPosition="bottom"
                  $tooltipAlign="center"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                    <RankNumber $pos={rankIndex}>
                      {rankIndex < 3 ? <MedalSvg rank={rankIndex} size={22} /> : rankIndex + 1}
                    </RankNumber>
                    <IdeaInfo>
                      <IdeaTitle>{idea.title}</IdeaTitle>
                      <IdeaAuthor>
                        Por {idea.author?.nickname || idea.author?.displayName || 'Participante'}
                        {showPendingScore && (
                          <> · <PendingBadge>Pendiente de evaluación</PendingBadge></>
                        )}
                      </IdeaAuthor>
                    </IdeaInfo>
                    <Metrics>
                      {phase === 'select' && (
                        <>
                          <Metric $active={metric === 'fireScore'}>
                            <Sparkles fill={metric === 'fireScore' ? Pista8Theme.primary : 'none'} /> {idea.likesCount || 0}
                          </Metric>
                          <Metric $active={metric === 'comments'}>
                            <MessageSquare fill={metric === 'comments' ? Pista8Theme.primary : 'none'} /> {idea.commentsCount || 0}
                          </Metric>
                        </>
                      )}
                      {(phase === 'evaluate' || phase === 'done') && (
                        <ScoreMetric $active>
                          <Trophy fill={Pista8Theme.primary} />
                          {showPendingScore ? '—' : (idea.finalScore || 0).toFixed(2)}
                          {showTieBreakInfo && (
                            <InfoTooltip text={TIEBREAK_TOOLTIP} size={16} width={260} />
                          )}
                        </ScoreMetric>
                      )}
                    </Metrics>
                  </div>
                </IdeaCard>
              </AnimatedRow>
            );
          })}
        </RankingList>
      </Container>

      {showConfirm && !readOnlyMode && createPortal(
        <ModalOverlay onClick={() => !isFinalizing && setShowConfirm(false)}>
          <Modal onClick={e => e.stopPropagation()}>
            <WarningIcon><AlertTriangle /></WarningIcon>
            <ModalContent>
              <ModalTitle>{confirmTitle}</ModalTitle>
              <ModalText>{confirmText}</ModalText>
            </ModalContent>
            {isFinalizing && (
              <ProcessingState>
                <Loader2 />
                {processingMessage}
              </ProcessingState>
            )}
            <ModalActions>
              <CancelBtn onClick={() => setShowConfirm(false)} disabled={isFinalizing}>Cancelar</CancelBtn>
              <ConfirmBtn onClick={handleConfirm} disabled={isFinalizing}>
                {confirmButtonLabel}
              </ConfirmBtn>
            </ModalActions>
          </Modal>
        </ModalOverlay>,
        document.body
      )}

      {showConfirmClose && !readOnlyMode && createPortal(
        <ModalOverlay onClick={() => !isClosing && setShowConfirmClose(false)}>
          <Modal onClick={e => e.stopPropagation()}>
            <WarningIcon style={{ background: 'rgba(254, 65, 10, 0.1)', color: '#FE410A' }}>
              <AlertTriangle />
            </WarningIcon>
            <ModalContent>
              <ModalTitle>¡Estás a punto de publicar los resultados!</ModalTitle>
              <ModalText>
                Al confirmar, el estado del reto pasará a <b>Histórico</b>. Esto revelará el podio a los estudiantes, deshabilitará nuevas evaluaciones y congelará cualquier edición. <b>¡Esta acción es irreversible!</b>
              </ModalText>
            </ModalContent>
            {isClosing && (
              <ProcessingState>
                <Loader2 />
                Publicando resultados y notificando...
              </ProcessingState>
            )}
            <ModalActions>
              <CancelBtn onClick={() => setShowConfirmClose(false)} disabled={isClosing}>Cancelar</CancelBtn>
              <ConfirmBtn 
                onClick={handleCloseChallenge} 
                disabled={isClosing}
              >
                Cerrar Reto
              </ConfirmBtn>
            </ModalActions>
          </Modal>
        </ModalOverlay>,
        document.body
      )}

      {scoresModalIdea && (
        <EvaluationScoresModal
          ideaId={scoresModalIdea.id}
          ideaTitle={scoresModalIdea.title}
          onClose={() => setScoresModalIdea(null)}
        />
      )}
    </>
  );
};
