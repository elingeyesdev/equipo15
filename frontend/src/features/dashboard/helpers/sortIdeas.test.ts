import { sortIdeas } from './sortIdeas';

describe('sortIdeas - Ordenamiento de Ideas (IdeationWall)', () => {
  it('Debe ordenar cronológicamente las ideas por defecto (más recientes primero)', () => {
    const ideas = [
      { id: '1', createdAt: '2026-06-10T10:00:00.000Z', likesCount: 0, commentsCount: 0 },
      { id: '2', createdAt: '2026-06-12T10:00:00.000Z', likesCount: 0, commentsCount: 0 },
      { id: '3', createdAt: '2026-06-11T10:00:00.000Z', likesCount: 0, commentsCount: 0 },
    ];

    const sorted = sortIdeas(ideas as any, {
      sortOrder: 'newest',
      topLimit: null,
      facultyId: null,
      onlyFavorites: false,
      onlyMyIdeas: false,
      onlyPodium: false
    });

    expect(sorted[0].id).toBe('2'); // El más reciente
    expect(sorted[1].id).toBe('3');
    expect(sorted[2].id).toBe('1'); // El más antiguo
  });

  it('Debe ordenar por cantidad de destellos (likes)', () => {
    const ideas = [
      { id: '1', createdAt: '2026-06-10T10:00:00.000Z', likesCount: 5, commentsCount: 0 },
      { id: '2', createdAt: '2026-06-12T10:00:00.000Z', likesCount: 10, commentsCount: 0 },
      { id: '3', createdAt: '2026-06-11T10:00:00.000Z', likesCount: 2, commentsCount: 0 },
    ];

    const sorted = sortIdeas(ideas as any, {
      sortOrder: 'likes',
      topLimit: null,
      facultyId: null,
      onlyFavorites: false,
      onlyMyIdeas: false,
      onlyPodium: false
    });

    expect(sorted[0].id).toBe('2'); // Mayor likes
    expect(sorted[1].id).toBe('1');
    expect(sorted[2].id).toBe('3');
  });
});
