export type UserRoleName = 'admin' | 'company' | 'judge' | 'student' | 'guest';

export class VisibilityStrategy {
  static applyToIdea(
    idea: any,
    userRole: UserRoleName,
    challengeStatus?: string,
  ): any {
    if (!idea || !idea.author) return idea;

    const projectedIdea = { ...idea };
    const safeAuthor = { ...projectedIdea.author };

    switch (userRole) {
      case 'admin':
        break;

      case 'company':
        if (challengeStatus !== 'Finalizado') {
          delete safeAuthor.phone;
          delete safeAuthor.email;
        }
        break;

      case 'judge':
      case 'student':
      case 'guest':
      default:
        delete safeAuthor.phone;
        delete safeAuthor.email;
        break;
    }

    projectedIdea.author = safeAuthor;
    return projectedIdea;
  }
}
