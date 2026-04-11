import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { Pista8Theme } from '../../config/theme';
import Cloud from './Cloud';
import Plane from './Plane';
import RaceOverlay from './RaceOverlay';
import PodiumScreen from './PodiumScreen';
import IdeasLoader from './IdeasLoader';
import { useAuth } from '../../context/AuthContext';
import { useWallSocket } from './useWallSocket';
import { computeCanvasHeight } from './flight.engine';
import { ideaService } from '../../services/idea.service';
import type { WallPhase } from './types';

interface RawIdea {
  _id?: string;
  id?: string;
  title: string;
  author?: { displayName?: string };
  likesCount?: number;
  commentsCount?: number;
}

const CLOUD_CONFIG = [
  { y: 40, scale: 1.2, duration: 38, delay: 0, rtl: false },
  { y: 90, scale: 0.8, duration: 52, delay: 8, rtl: true },
  { y: 180, scale: 1.0, duration: 44, delay: 3, rtl: false },
  { y: 260, scale: 0.7, duration: 60, delay: 15, rtl: true },
  { y: 340, scale: 1.1, duration: 41, delay: 5, rtl: false },
  { y: 430, scale: 0.9, duration: 56, delay: 20, rtl: true },
  { y: 520, scale: 0.75, duration: 48, delay: 10, rtl: false },
];

const ProgressBar = styled.div<{ $progress: number }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 4px;
  background: linear-gradient(90deg, ${Pista8Theme.primary}, #fff);
  width: ${p => p.$progress}%;
  transition: width 0.3s ease;
  z-index: 100;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
`;

const ScrollableSkyContainer = styled.div`
  max-height: 500px;
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 24px;
  margin-bottom: 3.5rem;
  width: 100%;
  position: relative;
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
}


interface SkyCanvasSceneProps {
  initialIdeas: RawIdea[];
  token?: string;
  isLoading?: boolean;
  progress?: number;
  challengeId?: string;
}

const SkyCanvasScene = memo(({ initialIdeas, token, isLoading = false, progress = 0, challengeId }: SkyCanvasSceneProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [showPodium, setShowPodium] = useState(false);
  const { ideas, phase: socketPhase } = useWallSocket(token, initialIdeas);

  const phase: WallPhase = useMemo(() => {
    return socketPhase === 'race' ? 'race' : 'active';
  }, [socketPhase]);

  const canvasHeight = useMemo(() => computeCanvasHeight(ideas.length), [ideas.length]);

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

  return (
    <ScrollableSkyContainer>
      {isLoading && <ProgressBar $progress={progress} />}
      <Sky ref={containerRef} $height={canvasHeight}>
        <CloudLayer>
          {CLOUD_CONFIG.map((c, i) => (
            <Cloud key={i} y={c.y} scale={c.scale} duration={c.duration} delay={c.delay} rtl={c.rtl} />
          ))}
        </CloudLayer>

        <PlaneLayer>
          {isLoading && <IdeasLoader />}
          {!isLoading && ideas.length === 0 && (
            <div style={{
              width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', color: 'rgba(72, 80, 84, 0.6)', fontWeight: 600, fontSize: '15px'
            }}>
              {!challengeId ? (
                <>
                  Selecciona un reto del panel izquierdo para ver las ideas
                </>
              ) : (
                <>
                  Aún no hay ideas en este reto. ¡Sé el primero en volar!
                </>
              )}
            </div>
          )}
          {ideas.map(idea => (
            <Plane key={idea.id} idea={idea} canvasWidth={canvasWidth} phase={phase} />
          ))}
        </PlaneLayer>

        {phase === 'race' && !showPodium && (
          <RaceOverlay onShowPodium={handleShowPodium} />
        )}

        {showPodium && <PodiumScreen ideas={ideas} />}
      </Sky>
    </ScrollableSkyContainer>
  );
});

SkyCanvasScene.displayName = 'SkyCanvasScene';

const extractRawIdeas = (payload: unknown): RawIdea[] => {
  const candidate = (payload as { data?: unknown } | null)?.data ?? payload;
  if (!candidate || !Array.isArray(candidate)) return [];

  return candidate
    .filter((item): item is RawIdea => typeof item === 'object' && item !== null)
    .map((item) => ({
      _id: typeof item._id === 'string' ? item._id : undefined,
      id: typeof item.id === 'string' ? item.id : undefined,
      title: typeof item.title === 'string' ? item.title : 'Idea sin titulo',
      author: typeof item.author === 'object' && item.author !== null
        ? { displayName: typeof (item.author as { displayName?: unknown }).displayName === 'string'
          ? (item.author as { displayName?: string }).displayName
          : undefined }
        : undefined,
      likesCount: typeof item.likesCount === 'number' ? item.likesCount : 0,
      commentsCount: typeof item.commentsCount === 'number' ? item.commentsCount : 0,
    }));
};

const SkyCanvas = memo(({ challengeId }: SkyCanvasProps) => {
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
    setIsLoading(true);
    setProgress(0);



    if (!challengeId) {
      setIsLoading(false);
      setProgress(100);
      return;
    }

    (async () => {
      try {
        const response = await ideaService.getIdeasByChallenge(challengeId);
        if (!active) return;
        const payload = (response as { success?: boolean; data?: unknown })?.success
          ? (response as { data?: unknown }).data
          : response;
        const ideas = extractRawIdeas(payload);

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
              }, 500);
              timeouts.push(hideTimer);
            }
          }, index * 300);
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
  }, [challengeId]);

  return <SkyCanvasScene initialIdeas={publicIdeas} token={token} isLoading={isLoading} progress={progress} challengeId={challengeId} />;
});

SkyCanvas.displayName = 'SkyCanvas';
export default SkyCanvas;
