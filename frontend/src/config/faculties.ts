export const FACULTIES = [
  { id: 1, name: 'Facultad de Ingeniería', slug: 'Ingeniería' },
  { id: 2, name: 'Facultad de Ciencias y Tecnología', slug: 'Ciencias' },
  { id: 3, name: 'Facultad de Humanidades', slug: 'Humanidades' },
  { id: 4, name: 'Facultad de Medicina', slug: 'Medicina' },
  { id: 5, name: 'Facultad de Derecho', slug: 'Derecho' },
  { id: 6, name: 'Facultad de Arquitectura', slug: 'Arquitectura' },
];

export const getFacultyName = (id: number) => FACULTIES.find(f => f.id === id)?.name || `Facultad ${id}`;
export const getFacultySlug = (id: number) => FACULTIES.find(f => f.id === id)?.slug || 'General';
