import type { PlaneIdea, SortMode } from './types';

const BASE_SIZE = 56;
const SCALE_FACTOR = 0.03;
const MAX_SCALE = 2.0;
const BASE_FLOAT_DURATION = 3.0;
const MIN_FLOAT_DURATION = 1.2;
const FLOAT_SPEED_FACTOR = 0.12;
const STEP_PX = 20;
const CANVAS_ACTIVE_CAP = 0.82;
const MIN_CANVAS_HEIGHT = 600;
const ONE_HOUR_MS = 3_600_000;

export const LANE_HEIGHT_PER_IDEA = 110;
export const TOP_PADDING = 120;
export const BOTTOM_PADDING = 100;
const START_X = 80;

export const computeScale = (likesCount: number): number => {
  const scale = 1 + (likesCount * SCALE_FACTOR);
  return Math.min(scale, MAX_SCALE);
};

export const computeFloatDuration = (likesCount: number): number => {
  const duration = BASE_FLOAT_DURATION - (likesCount * FLOAT_SPEED_FACTOR);
  return Math.max(duration, MIN_FLOAT_DURATION);
};

export const computeSize = (likesCount: number): number => {
  return Math.round(BASE_SIZE * computeScale(likesCount));
};

export const computeXPosition = (commentsCount: number, canvasWidth: number): number =>
  Math.min(START_X + commentsCount * STEP_PX, canvasWidth * CANVAS_ACTIVE_CAP);

export const computeCanvasHeight = (ideaCount: number): number => {
  const contentHeight = ideaCount * LANE_HEIGHT_PER_IDEA;
  const total = contentHeight + TOP_PADDING + BOTTOM_PADDING;
  return Math.max(MIN_CANVAS_HEIGHT, total);
};

export const assignLanes = (count: number): number[] => {
  if (count === 0) return [];
  return Array.from({ length: count }, (_, i) => TOP_PADDING + (i * LANE_HEIGHT_PER_IDEA));
};

type Comparator = (a: PlaneIdea, b: PlaneIdea) => number;

const SORT_COMPARATORS: Record<SortMode, Comparator> = {
  likes: (a, b) => b.likesCount - a.likesCount,
  comments: (a, b) => b.commentsCount - a.commentsCount,
  newest: (a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  },
  oldest: (a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateA - dateB;
  },
};

export const sortIdeas = (ideas: PlaneIdea[], mode: SortMode): PlaneIdea[] => {
  const comparator = SORT_COMPARATORS[mode];
  return [...ideas]
    .sort(comparator)
    .map((idea, index) => ({
      ...idea,
      laneY: TOP_PADDING + index * LANE_HEIGHT_PER_IDEA,
    }));
};

export const computeGlowIntensity = (createdAt?: string): number => {
  if (!createdAt) return 0;
  const elapsed = Date.now() - new Date(createdAt).getTime();
  if (elapsed > ONE_HOUR_MS) return 0;
  return 1 - elapsed / ONE_HOUR_MS;
};
