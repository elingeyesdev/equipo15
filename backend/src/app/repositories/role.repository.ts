// This file is intentionally left as a re-export of UserRole.
// The Role table was removed and replaced by the UserRole enum in Prisma.
// This file is kept to avoid breaking module imports during transition.
// TODO: Remove this file and all references once the codebase is fully migrated.

export { UserRole } from '@prisma/client';
