import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import Cloud from './Cloud';
import Plane from './Plane';
import RaceOverlay from './RaceOverlay';
import PodiumScreen from './PodiumScreen';
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

const Sky = styled.div<{ $height: number }>`
  position: relative;
  width: 100%;
  height: ${p => p.$height}px;
  background: linear-gradient(180deg, #87ceeb 0%, #b8e8ff 60%, #d4f1ff 100%);
  overflow: hidden;
  border-radius: 24px;
  margin-bottom: 3.5rem;
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

const EmptyHint = styled.p`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #1a4a6b;
  font-size: 14px;
  font-weight: 600;
  opacity: 0.5;
  user-select: none;
`;

interface SkyCanvasProps {
  initialIdeas?: RawIdea[];
}

const EMPTY_RAW_IDEAS: RawIdea[] = [];

interface SkyCanvasSceneProps {
  initialIdeas: RawIdea[];
  token?: string;
}

const SkyCanvasScene = memo(({ initialIdeas, token }: SkyCanvasSceneProps) => {
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
    <Sky ref={containerRef} $height={canvasHeight}>
      <CloudLayer>
        {CLOUD_CONFIG.map((c, i) => (
          <Cloud key={i} y={c.y} scale={c.scale} duration={c.duration} delay={c.delay} rtl={c.rtl} />
        ))}
      </CloudLayer>

      <PlaneLayer>
        {ideas.length === 0 && <EmptyHint>Las ideas aparecerán aquí al publicarse</EmptyHint>}
        {ideas.map(idea => (
          <Plane key={idea.id} idea={idea} canvasWidth={canvasWidth} phase={phase} />
        ))}
      </PlaneLayer>

      {phase === 'race' && !showPodium && (
        <RaceOverlay onShowPodium={handleShowPodium} />
      )}

      {showPodium && <PodiumScreen ideas={ideas} />}
    </Sky>
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

const SkyCanvas = memo(({ initialIdeas = EMPTY_RAW_IDEAS }: SkyCanvasProps) => {
  const [token, setToken] = useState<string>();
  const [publicIdeas, setPublicIdeas] = useState<RawIdea[]>(initialIdeas);
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

    console.info('[SkyCanvas] Iniciando carga de ideas desde la base de datos...');

    (async () => {
      try {
        const response = await ideaService.getAllIdeas();
        if (!active) return;
        const payload = (response as { success?: boolean; data?: unknown })?.success
          ? (response as { data?: unknown }).data
          : response;
        const ideas = extractRawIdeas(payload);
        console.info(
          `[SkyCanvas] Ideas cargadas correctamente: ${ideas.length}`,
        );
        setPublicIdeas(ideas.length > 0 ? ideas : initialIdeas);
      } catch (loadError: unknown) {
        console.error('[SkyCanvas] Error leyendo ideas desde la base de datos:', loadError);
        if (active) setPublicIdeas(initialIdeas);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return <SkyCanvasScene initialIdeas={publicIdeas} token={token} />;
});

SkyCanvas.displayName = 'SkyCanvas';
export default SkyCanvas;
