import type { RawIdea } from '../../sky-wall/types';
import type { AdvancedFilterState } from '../components/AdvancedFilter';

export function sortIdeas(ideas: RawIdea[], advFilter: AdvancedFilterState): RawIdea[] {
  return [...ideas].sort((a, b) => {
    if (advFilter.sortOrder === 'oldest') {
      return new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime();
    }
    if (advFilter.sortOrder === 'likes') {
      return (b.likesCount || 0) - (a.likesCount || 0);
    }
    if (advFilter.sortOrder === 'comments') {
      return (b.commentsCount || 0) - (a.commentsCount || 0);
    }
    return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
  });
}
