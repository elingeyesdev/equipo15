import { FACULTY_DICTIONARY } from './faculty.dictionary';

export function extractFacultyFromEmail(email: string): number | null {
  if (!email) return null;

  // 1. Normalización estricta (Punto 1 del usuario)
  const normalizedEmail = email.toLowerCase();

  let longestMatchId: number | null = null;
  let longestMatchLength = 0;

  // 2. Escáner de Prioridad por Longitud (Punto 2 del usuario)
  for (const [facultyIdStr, keywords] of Object.entries(FACULTY_DICTIONARY)) {
    const defaultId = Number(facultyIdStr);

    for (const keyword of keywords) {
      if (normalizedEmail.includes(keyword)) {
        // En caso de que tenga "tecnologia.medica@...", elegirá la palabra más larga ("tecnologia" = 10 letras vs "medica" = 6)
        // para dar preeminencia al contexto primario del dominio o usuario.
        if (keyword.length > longestMatchLength) {
          longestMatchLength = keyword.length;
          longestMatchId = defaultId;
        }
      }
    }
  }

  return longestMatchId;
}
