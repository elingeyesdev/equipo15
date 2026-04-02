import { FACULTY_DICTIONARY } from './faculty.dictionary';

export function extractFacultyFromEmail(email: string): number | null {
  if (!email) return null;

  const normalizedEmail = email.toLowerCase();

  let longestMatchId: number | null = null;
  let longestMatchLength = 0;

  for (const [facultyIdStr, keywords] of Object.entries(FACULTY_DICTIONARY)) {
    const defaultId = Number(facultyIdStr);

    for (const keyword of keywords) {
      if (normalizedEmail.includes(keyword)) {
        if (keyword.length > longestMatchLength) {
          longestMatchLength = keyword.length;
          longestMatchId = defaultId;
        }
      }
    }
  }

  return longestMatchId;
}
