export const FACULTIES = [
  { id: 1, name: 'Facultad de Ingeniería', slug: 'Ingeniería' },
  { id: 2, name: 'Facultad de Ciencias y Tecnología', slug: 'Ciencias' },
  { id: 3, name: 'Facultad de Humanidades', slug: 'Humanidades' },
  { id: 4, name: 'Facultad de Medicina', slug: 'Medicina' },
  { id: 5, name: 'Facultad de Derecho', slug: 'Derecho' },
  { id: 6, name: 'Facultad de Arquitectura', slug: 'Arquitectura' },
];

export const getFacultyName = (id: string | number | null, facultyName?: string | null): string => {
  if (facultyName) return `Facultad de ${facultyName}`;
  if (id === null || id === undefined) return 'Todas las Facultades';
  if (typeof id === 'number') {
    return FACULTIES.find(f => f.id === id)?.name || `Facultad ${id}`;
  }
  const numId = Number(id);
  if (!isNaN(numId) && numId >= 1 && numId <= 6) {
    return FACULTIES.find(f => f.id === numId)?.name || `Facultad ${id}`;
  }
  return 'Facultad';
};

export const getFacultySlug = (id: string | number | null, facultyName?: string | null): string => {
  if (facultyName) return facultyName;
  if (id === null || id === undefined) return 'Todas';
  if (typeof id === 'number') {
    return FACULTIES.find(f => f.id === id)?.slug || 'General';
  }
  const numId = Number(id);
  if (!isNaN(numId) && numId >= 1 && numId <= 6) {
    return FACULTIES.find(f => f.id === numId)?.slug || 'General';
  }
  return 'General';
};
