const BASE_SIZE = 56;
const SIZE_FACTOR = 4;
const MAX_SIZE = 120;
const STEP_PX = 40;
const CANVAS_ACTIVE_CAP = 0.82;
const MIN_CANVAS_HEIGHT = 600;
export const LANE_HEIGHT_PER_IDEA = 110;
export const TOP_PADDING = 120;
export const BOTTOM_PADDING = 100;
const START_X = 80;

export const computeSize = (likesCount: number): number =>
  Math.min(BASE_SIZE + likesCount * SIZE_FACTOR, MAX_SIZE);

export const computeXPosition = (commentsCount: number, canvasWidth: number): number =>
  Math.min(START_X + commentsCount * STEP_PX, canvasWidth * CANVAS_ACTIVE_CAP);

export const computeCanvasHeight = (ideaCount: number): number => {
  const contentHeight = ideaCount * LANE_HEIGHT_PER_IDEA;
  const total = contentHeight + TOP_PADDING + BOTTOM_PADDING;
  return Math.max(MIN_CANVAS_HEIGHT, total);
};

export const assignLanes = (count: number, _canvasHeight: number): number[] => {
  if (count === 0) return [];
  return Array.from({ length: count }, (_, i) => TOP_PADDING + (i * LANE_HEIGHT_PER_IDEA));
};
