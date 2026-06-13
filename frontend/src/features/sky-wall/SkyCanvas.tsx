import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Pista8Theme } from '../../config/theme';
import Cloud from './Cloud';
import Plane from './Plane';
import RaceOverlay from './RaceOverlay';
import PodiumScreen from './PodiumScreen';
import IdeasLoader from './IdeasLoader';
import IdeaDetailModal from './components/IdeaDetailModal';
import { useWallSocket } from './useWallSocket';
import { computeCanvasHeight, sortIdeas, computeGlowIntensity } from './flight.engine';
import { ideaService } from '../../services/idea.service';
import { extractRawIdeas } from './raw-idea.parser';
import type { WallPhase, PlaneIdea, RawIdea, SortMode } from './types';
import { Trophy } from 'lucide-react';


const generateClouds = (height: number) => {
  const clouds = [];
  const spacing = 280;
  const count = Math.ceil(height / spacing) + 1;

  for (let i = 0; i < count; i++) {
    clouds.push({
      y: i * spacing + (Math.random() * 80),
      scale: 0.6 + Math.random() * 0.7,
      duration: 35 + Math.random() * 25,
      delay: i * -5,
      rtl: i % 2 === 0
    });
  }
  return clouds;
};

const ProgressBarContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 28px;
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(6px);
  z-index: 100;
  display: flex;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.5);
`;

const ProgressBar = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${p => p.$progress}%;
  background: linear-gradient(
    90deg,
    ${Pista8Theme.primary}90,
    ${Pista8Theme.primary},
    #ff7b00,
    ${Pista8Theme.primary}
  );
  background-size: 300% 100%;
  animation: ${keyframes`
    0%   { background-position: 100% center; }
    100% { background-position: -100% center; }
  `} 1.8s linear infinite;
  transition: width 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 10px;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    width: 40px;
    height: 100%;
    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.25));
    border-radius: 0 2px 2px 0;
  }
`;

const ProgressText = styled.span`
  color: white;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  white-space: nowrap;
  position: relative;
  z-index: 1;
`;

const ProgressLabel = styled.span`
  position: absolute;
  right: 12px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(72, 80, 84, 0.45);
  white-space: nowrap;
  pointer-events: none;
`;

const SkyCanvasWrapper = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 3.5rem;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(135, 206, 235, 0.4), 0 2px 8px rgba(0,0,0,0.06);
`;

const ScrollableSkyContainer = styled.div`
  max-height: 460px;
  overflow-y: scroll;
  overflow-x: hidden;
  width: 100%;
  border-radius: 24px;

  /* Ocultar scrollbar en todos los navegadores */
  scrollbar-width: none;        /* Firefox */
  -ms-overflow-style: none;     /* IE / Edge */
  &::-webkit-scrollbar {
    display: none;              /* Chrome / Safari / Opera */
  }
`;

const Sky = styled.div<{ $height: number }>`
  position: relative;
  width: 100%;
  height: ${p => p.$height}px;
  background: linear-gradient(180deg, #87ceeb 0%, #b8e8ff 60%, #d4f1ff 100%);
  background-attachment: fixed;
  overflow: hidden;
`;

const CloudLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
`;

const PlaneLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;
`;

const slideDown = keyframes`
  from { transform: translateY(-100%); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
`;

const TopBanner = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #FE410A, #FF7B00);
  color: white;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-weight: 800;
  font-size: 1.1rem;
  box-shadow: 0 4px 20px rgba(254, 65, 10, 0.4);
  animation: ${slideDown} 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  z-index: 30;
`;

const EvalOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 40;
  backdrop-filter: blur(4px);
`;

const EvalBox = styled.div`
  text-align: center;
  padding: 32px 48px;
  background: rgba(30, 30, 30, 0.85);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  max-width: 90%;
`;

const EvalTitle = styled.h2`
  font-size: clamp(24px, 4vw, 42px);
  font-weight: 900;
  color: white;
  letter-spacing: 0.12em;
  margin: 0 0 12px;
  text-transform: uppercase;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
`;

const EvalSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.15rem;
  font-weight: 600;
  margin: 0;
  letter-spacing: 0.03em;
`;

interface SkyCanvasProps {
  initialIdeas?: RawIdea[];
  challengeId?: string;
  challengeTitle?: string;
  challengeFacultyId?: number | string | null;
  isDashboardLoading?: boolean;
  search?: string;
  sort?: SortMode;
  challengeStatus?: string;
  onIdeasLoaded?: (ideas: RawIdea[]) => void;
  onlyFavorites?: boolean;
  topLimit?: number | null;
  facultyId?: number | string | null;
  highlightedIdeaId?: string | null;
  onlyMyIdeas?: boolean;
  currentUserId?: string;
}

interface SkyCanvasSceneProps {
  initialIdeas: RawIdea[];
  isLoading?: boolean;
  progress?: number;
  challengeId?: string;
  challengeTitle?: string;
  challengeFacultyId?: number | string | null;
  isDashboardLoading?: boolean;
  search?: string;
  sort?: SortMode;
  challengeStatus?: string;
  onlyFavorites?: boolean;
  topLimit?: number | null;
  facultyId?: number | string | null;
  highlightedIdeaId?: string | null;
  onlyMyIdeas?: boolean;
  currentUserId?: string;
}

const SkyCanvasScene = memo(({ initialIdeas, isLoading = false, progress = 0, challengeId, challengeTitle, challengeFacultyId, isDashboardLoading = false, search, sort, challengeStatus, onlyFavorites = false, topLimit, facultyId, highlightedIdeaId, onlyMyIdeas = false, currentUserId }: SkyCanvasSceneProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [showPodium, setShowPodium] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<PlaneIdea | null>(null);
  const { ideas, phase: socketPhase } = useWallSocket(
    initialIdeas,
    challengeTitle,
  );

  const phase: WallPhase = useMemo(() => {
    if (challengeStatus === 'CLOSED') return 'race';
    return socketPhase === 'race' ? 'race' : 'active';
  }, [socketPhase, challengeStatus]);

  useEffect(() => {
    if (challengeStatus === 'CLOSED') {
      setShowPodium(true);
    }
  }, [challengeStatus]);

  const statusUpper = challengeStatus?.toUpperCase() || '';
  const isEvaluating = statusUpper === 'EVALUATING' || statusUpper === 'EN_EVALUACION' || statusUpper === 'EN EVALUACIÓN';

  const displayIdeas = useMemo(() => {
    let filteredIdeas = onlyFavorites
      ? ideas.filter((idea) => Boolean(idea.hasFavorited))
      : [...ideas];
    if (onlyMyIdeas && currentUserId) {
      filteredIdeas = filteredIdeas.filter(idea => idea.authorId === currentUserId);
    }
    if (facultyId) {
      filteredIdeas = filteredIdeas.filter(idea => idea.authorFacultyId === facultyId);
    }
    const base = sort ? sortIdeas(filteredIdeas, sort) : filteredIdeas;
    const limited = topLimit ? base.slice(0, topLimit) : base;
    return limited.map(i => ({ ...i, challengeStatus }));
  }, [ideas, sort, challengeStatus, onlyFavorites, topLimit, facultyId, onlyMyIdeas, currentUserId]);

  const currentSelectedIdea = useMemo(() => {
    if (!selectedIdea) return null;
    return displayIdeas.find(i => i.id === selectedIdea.id) || selectedIdea;
  }, [selectedIdea, displayIdeas]);

  const canvasHeight = useMemo(() => computeCanvasHeight(displayIdeas.length), [displayIdeas.length]);
  const clouds = useMemo(() => generateClouds(canvasHeight), [canvasHeight]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect.width;
      if (width) setCanvasWidth(width);
    });
    obs.observe(el);
    setCanvasWidth(el.getBoundingClientRect().width);
    return () => obs.disconnect();
  }, []);

  const handleShowPodium = useCallback(() => setShowPodium(true), []);

  const isNewestMode = sort === 'newest';
  const hasAnyGlow = isNewestMode && displayIdeas.some(i => computeGlowIntensity(i.createdAt) > 0);

  return (
    <SkyCanvasWrapper>
      <ScrollableSkyContainer>
        <Sky ref={containerRef} $height={canvasHeight}>
          <CloudLayer>
            {clouds.map((c, i) => (
              <Cloud key={i} y={c.y} scale={c.scale} duration={c.duration} delay={c.delay} rtl={c.rtl} />
            ))}
          </CloudLayer>

          <PlaneLayer>
            {(isLoading || isDashboardLoading) && <IdeasLoader />}
            {!(isLoading || isDashboardLoading) && displayIdeas.length === 0 && (
              <div style={{
                width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', color: 'rgba(72, 80, 84, 0.6)', fontWeight: 600, fontSize: '15px'
              }}>
                {search && search.trim().length > 0 ? (
                  <>Sin resultados para: "{search}"</>
                ) : onlyFavorites ? (
                  <>Aun no tienes ideas marcadas como favoritas.</>
                ) : !challengeId ? (
                  <>
                    No hay retos activos en tu tripulación. ¡Regresa más tarde!
                  </>
                ) : (
                  <>
                    Aun no hay ideas en este reto.
                  </>
                )}
              </div>
            )}
            {displayIdeas.map(idea => (
              <Plane
                key={idea.id}
                idea={idea}
                canvasWidth={canvasWidth}
                phase={phase}
                challengeFacultyId={challengeFacultyId}
                glowIntensity={isNewestMode ? computeGlowIntensity(idea.createdAt) : 0}
                dimmed={hasAnyGlow && computeGlowIntensity(idea.createdAt) === 0}
                isHighlighted={idea.id === highlightedIdeaId}
                onClick={() => setSelectedIdea(idea)}
              />
            ))}
          </PlaneLayer>

          {phase === 'race' && !showPodium && (
            <RaceOverlay onShowPodium={handleShowPodium} />
          )}

          {showPodium && !isEvaluating && <PodiumScreen ideas={ideas} onSelectIdea={setSelectedIdea} />}

          {isEvaluating && (
            <>
              <TopBanner>
                <Trophy size={20} /> Reto Finalizado
              </TopBanner>
              <EvalOverlay>
                <EvalBox>
                  <EvalTitle>RETO FINALIZADO</EvalTitle>
                  <EvalSubtitle>Las ideas están siendo calificadas...</EvalSubtitle>
                </EvalBox>
              </EvalOverlay>
            </>
          )}
        </Sky>
      </ScrollableSkyContainer>

      {isLoading && (
        <ProgressBarContainer>
          <ProgressBar $progress={progress}>
            {progress > 8 && <ProgressText>{Math.round(progress)}%</ProgressText>}
          </ProgressBar>
          {progress <= 8 && <ProgressLabel>Cargando ideas</ProgressLabel>}
        </ProgressBarContainer>
      )}

      {currentSelectedIdea && (
        <IdeaDetailModal idea={currentSelectedIdea} onClose={() => setSelectedIdea(null)} />
      )}
    </SkyCanvasWrapper>
  );
});

SkyCanvasScene.displayName = 'SkyCanvasScene';



const SkyCanvas = memo(({ challengeId, challengeTitle, challengeFacultyId, isDashboardLoading, search, sort, challengeStatus, onIdeasLoaded, onlyFavorites = false, topLimit, facultyId, highlightedIdeaId, onlyMyIdeas, currentUserId }: SkyCanvasProps) => {
  const [publicIdeas, setPublicIdeas] = useState<RawIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let active = true;
    let timeouts: number[] = [];

    setPublicIdeas([]);
    setProgress(0);

    if (isDashboardLoading) {
      return;
    }

    if (!challengeId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    (async () => {
      try {
        const response = await ideaService.getIdeasByChallenge(challengeId, search, sort);
        if (!active) return;
        const payload = (response as { success?: boolean; data?: unknown })?.success
          ? (response as { data?: unknown }).data
          : response;
        const ideas = extractRawIdeas(payload);
        if (active) onIdeasLoaded?.(ideas);

        if (ideas.length === 0) {
          setProgress(100);
          const t = window.setTimeout(() => {
            if (active) setIsLoading(false);
          }, 300);
          timeouts.push(t);
          return;
        }

        const total = ideas.length;
        let loaded = 0;

        ideas.forEach((idea, index) => {
          const t = window.setTimeout(() => {
            if (!active) return;
            setPublicIdeas(prev => [...prev, idea]);
            loaded++;
            setProgress((loaded / total) * 100);

            if (loaded === total) {
              const hideTimer = window.setTimeout(() => {
                if (active) setIsLoading(false);
              }, 400);
              timeouts.push(hideTimer);
            }
          }, index * 30);
          timeouts.push(t);
        });
      } catch (loadError: unknown) {
        if (active) {
          setPublicIdeas([]);
          setIsLoading(false);
          setProgress(100);
        }
      }
    })();

    return () => {
      active = false;
      timeouts.forEach(clearTimeout);
    };
  }, [challengeId, search, sort]);

  return <SkyCanvasScene initialIdeas={publicIdeas} isLoading={isLoading} progress={progress} challengeId={challengeId} challengeTitle={challengeTitle} challengeFacultyId={challengeFacultyId} isDashboardLoading={isDashboardLoading} search={search} sort={sort} challengeStatus={challengeStatus} onlyFavorites={onlyFavorites} topLimit={topLimit} facultyId={facultyId} highlightedIdeaId={highlightedIdeaId} onlyMyIdeas={onlyMyIdeas} currentUserId={currentUserId} />;
});

SkyCanvas.displayName = 'SkyCanvas';
export default SkyCanvas;
