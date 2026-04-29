import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Pista8Theme } from '../../config/theme';
import Cloud from './Cloud';
import Plane from './Plane';
import RaceOverlay from './RaceOverlay';
import PodiumScreen from './PodiumScreen';
import IdeasLoader from './IdeasLoader';
import IdeaDetailModal from './components/IdeaDetailModal';
import { useAuth } from '../../context/AuthContext';
import { useWallSocket } from './useWallSocket';
import { computeCanvasHeight, sortIdeas, computeGlowIntensity } from './flight.engine';
import { ideaService } from '../../services/idea.service';
import { extractRawIdeas } from './raw-idea.parser';
import type { WallPhase, PlaneIdea, RawIdea, SortMode } from './types';


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
`;

const ScrollableSkyContainer = styled.div`
  max-height: 460px;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
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

interface SkyCanvasProps {
  initialIdeas?: RawIdea[];
  challengeId?: string;
  challengeTitle?: string;
  challengeFacultyId?: number;
  isDashboardLoading?: boolean;
  search?: string;
  sort?: SortMode;
  challengeStatus?: string;
  onIdeasLoaded?: (ideas: RawIdea[]) => void;
  onlyFavorites?: boolean;
}

interface SkyCanvasSceneProps {
  initialIdeas: RawIdea[];
  token?: string;
  isLoading?: boolean;
  progress?: number;
  challengeId?: string;
  challengeTitle?: string;
  challengeFacultyId?: number;
  isDashboardLoading?: boolean;
  search?: string;
  sort?: SortMode;
  challengeStatus?: string;
  onlyFavorites?: boolean;
}

const SkyCanvasScene = memo(({ initialIdeas, token, isLoading = false, progress = 0, challengeId, challengeTitle, challengeFacultyId, isDashboardLoading = false, search, sort, challengeStatus, onlyFavorites = false }: SkyCanvasSceneProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [showPodium, setShowPodium] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<PlaneIdea | null>(null);
  const { ideas, phase: socketPhase } = useWallSocket(
    token,
    initialIdeas,
    challengeTitle,
  );

  const phase: WallPhase = useMemo(() => {
    return socketPhase === 'race' ? 'race' : 'active';
  }, [socketPhase]);

  const displayIdeas = useMemo(() => {
    const filteredIdeas = onlyFavorites
      ? ideas.filter((idea) => Boolean(idea.hasFavorited))
      : ideas;
    const base = sort ? sortIdeas(filteredIdeas, sort) : filteredIdeas;
    return base.map(i => ({ ...i, challengeStatus }));
  }, [ideas, sort, challengeStatus, onlyFavorites]);

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
                onClick={() => setSelectedIdea(idea)}
              />
            ))}
          </PlaneLayer>

          {phase === 'race' && !showPodium && (
            <RaceOverlay onShowPodium={handleShowPodium} />
          )}

          {showPodium && <PodiumScreen ideas={displayIdeas} />}
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



const SkyCanvas = memo(({ challengeId, challengeTitle, challengeFacultyId, isDashboardLoading, search, sort, challengeStatus, onIdeasLoaded, onlyFavorites = false }: SkyCanvasProps) => {
  const [token, setToken] = useState<string>();
  const [publicIdeas, setPublicIdeas] = useState<RawIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    let active = true;
    user.getIdToken().then((nextToken: string) => {
      if (active) setToken(nextToken);
    }).catch(console.error);

    return () => {
      active = false;
    };
  }, [user]);

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

  return <SkyCanvasScene initialIdeas={publicIdeas} token={token} isLoading={isLoading} progress={progress} challengeId={challengeId} challengeTitle={challengeTitle} challengeFacultyId={challengeFacultyId} isDashboardLoading={isDashboardLoading} search={search} sort={sort} challengeStatus={challengeStatus} onlyFavorites={onlyFavorites} />;
});

SkyCanvas.displayName = 'SkyCanvas';
export default SkyCanvas;
