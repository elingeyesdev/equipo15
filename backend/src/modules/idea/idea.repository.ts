import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { Idea, Prisma } from '@prisma/client';

interface IdeaWhereInput {
  challengeId?: string;
  status?: any;
}

export interface IdeaWithVoteStatus extends Idea {
  hasVoted: boolean;
  hasFavorited: boolean;
}

@Injectable()
export class IdeaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    skip?: number,
    take?: number,
    challengeId?: string,
  ): Promise<{ data: Idea[]; total: number }> {
    const where: IdeaWhereInput = {};
    if (challengeId) where.challengeId = challengeId;

    const [data, total] = await Promise.all([
      this.prisma.idea.findMany({
        where,
        skip,
        take,
        include: {
          author: {
            select: {
              displayName: true,
              nickname: true,
              role: true,
              studentProfile: {
                select: {
                  facultyId: true,
                  faculty: { select: { name: true } },
                },
              },
            },
          },
          challenge: true,
        },
      }),
      this.prisma.idea.count({ where }),
    ]);
    return { data, total };
  }

  private buildWhereClause(challengeId?: string, search?: string): any {
    const where: any = { status: { in: ['PUBLISHED', 'FINALIST', 'WINNER'] } };
    if (challengeId) where.challengeId = challengeId;

    if (search && search.trim().length > 0) {
      const keyword = search.trim();
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { problem: { contains: keyword, mode: 'insensitive' } },
        { solution: { contains: keyword, mode: 'insensitive' } },
      ];
    }
    return where;
  }

  async findPublic(
    skip?: number,
    take?: number,
    challengeId?: string,
    userId?: string,
    search?: string,
    sort?: 'newest' | 'oldest' | 'likes' | 'comments',
  ): Promise<{ data: IdeaWithVoteStatus[]; total: number }> {
    const where = this.buildWhereClause(challengeId, search);

    let orderBy: Record<string, 'asc' | 'desc'>;
    switch (sort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'likes':
        orderBy = { likesCount: 'desc' };
        break;
      case 'comments':
        orderBy = { commentsCount: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [data, total] = await Promise.all([
      this.prisma.idea.findMany({
        where,
        skip,
        take,
        orderBy,
        select: {
          id: true,
          title: true,
          problem: true,
          solution: true,
          status: true,
          likesCount: true,
          commentsCount: true,
          favoritesCount: true,
          isAnonymous: true,
          multimediaLinks: true,
          createdAt: true,
          updatedAt: true,
          authorId: true,
          challengeId: true,
          finalScore: true,
          author: {
            select: {
              displayName: true,
              nickname: true,
              email: true,
              phone: true,
              role: true,
              avatarUrl: true,
              studentProfile: {
                select: {
                  facultyId: true,
                  faculty: { select: { name: true } },
                },
              },
            },
          },
          challenge: { select: { status: true } },
          ...(userId
            ? {
                reactions: {
                  where: { userId },
                  select: { id: true, type: true },
                },
              }
            : {}),
        },
      }),
      this.prisma.idea.count({ where }),
    ]);

    const enriched: IdeaWithVoteStatus[] = data.map((idea) => {
      const { reactions, ...rest } = idea as any;
      return {
        ...rest,
        hasVoted:
          Array.isArray(reactions) &&
          reactions.some((r: any) => r.type === 'LIKE'),
        hasFavorited:
          Array.isArray(reactions) &&
          reactions.some((r: any) => r.type === 'FAVORITE'),
      } as IdeaWithVoteStatus;
    });

    return { data: enriched, total };
  }

  async findById(id: string): Promise<Idea | null> {
    return this.prisma.idea.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            nickname: true,
            email: true,
            phone: true,
            role: true,
            studentProfile: {
              select: { facultyId: true, faculty: { select: { name: true } } },
            },
          },
        },
        challenge: true,
      },
    });
  }

  async create(
    data: Prisma.IdeaCreateInput | Prisma.IdeaUncheckedCreateInput,
  ): Promise<Idea> {
    return this.prisma.idea.create({
      data: data as Prisma.IdeaUncheckedCreateInput,
    });
  }

  async update(id: string, data: Prisma.IdeaUpdateInput): Promise<Idea> {
    return this.prisma.idea.update({
      where: { id },
      data,
    });
  }

  async upsertLike(
    ideaId: string,
    userId: string,
    targetReaction: string,
  ): Promise<any> {
    const fireDelta = targetReaction === 'COMPLEX' ? 0.5 : 2;
    const countField =
      targetReaction === 'GOOD'
        ? 'goodCount'
        : targetReaction === 'FUTURE'
          ? 'futureCount'
          : 'complexCount';

    try {
      // Usar transaction para intentar crear y si falla (P2002), actualizar en otra petición no es atómico.
      // Upsert es atómico a nivel de tabla IdeaReaction, pero necesitamos actualizar Idea al mismo tiempo.
      // Así que usaremos la transacción interactiva de Prisma para hacer ambas cosas de forma segura.
      return await this.prisma.$transaction(async (tx) => {
        const existing = await tx.ideaReaction.findUnique({
          where: { uq_reaction_per_type: { ideaId, userId, type: 'LIKE' } },
        });

        if (existing) {
          if (existing.reactionType === targetReaction) {
            // Eliminar reacción si es la misma
            await tx.ideaReaction.delete({
              where: { id: existing.id },
            });
            const oldFireDelta =
              existing.reactionType === 'COMPLEX' ? -0.5 : -2;
            const oldField =
              existing.reactionType === 'GOOD'
                ? 'goodCount'
                : existing.reactionType === 'FUTURE'
                  ? 'futureCount'
                  : 'complexCount';
            const updatedIdea = await tx.idea.update({
              where: { id: ideaId },
              data: {
                likesCount: { decrement: 1 },
                [oldField]: { decrement: 1 },
                fireScore: { increment: oldFireDelta },
              },
            });
            return { updatedIdea, hasVoted: false };
          } else {
            // Actualizar reacción
            await tx.ideaReaction.update({
              where: { id: existing.id },
              data: { reactionType: targetReaction },
            });
            const oldFireDelta =
              existing.reactionType === 'COMPLEX' ? -0.5 : -2;
            const oldField =
              existing.reactionType === 'GOOD'
                ? 'goodCount'
                : existing.reactionType === 'FUTURE'
                  ? 'futureCount'
                  : 'complexCount';
            const updatedIdea = await tx.idea.update({
              where: { id: ideaId },
              data: {
                [oldField]: { decrement: 1 },
                [countField]: { increment: 1 },
                fireScore: { increment: oldFireDelta + fireDelta },
              },
            });
            return { updatedIdea, hasVoted: true };
          }
        } else {
          // Crear reacción (puede lanzar P2002 si hay concurrencia extrema, el service lo capturará)
          await tx.ideaReaction.create({
            data: {
              ideaId,
              userId,
              type: 'LIKE',
              reactionType: targetReaction,
            },
          });
          const updatedIdea = await tx.idea.update({
            where: { id: ideaId },
            data: {
              likesCount: { increment: 1 },
              [countField]: { increment: 1 },
              fireScore: { increment: fireDelta },
            },
          });
          return { updatedIdea, hasVoted: true };
        }
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw error; // Re-throw to be caught by service
      }
      throw error;
    }
  }

  async toggleFavoriteAtomic(ideaId: string, userId: string): Promise<boolean> {
    return await this.prisma.$transaction(async (tx) => {
      const existing = await tx.ideaReaction.findUnique({
        where: { uq_reaction_per_type: { ideaId, userId, type: 'FAVORITE' } },
      });

      if (existing) {
        await tx.ideaReaction.delete({
          where: { id: existing.id },
        });
        await tx.idea.update({
          where: { id: ideaId },
          data: { favoritesCount: { decrement: 1 } },
        });
        return false;
      } else {
        await tx.ideaReaction.create({
          data: { ideaId, userId, type: 'FAVORITE' },
        });
        await tx.idea.update({
          where: { id: ideaId },
          data: { favoritesCount: { increment: 1 } },
        });
        return true;
      }
    });
  }

  async incrementComments(id: string): Promise<Idea> {
    return this.prisma.idea.update({
      where: { id },
      data: {
        commentsCount: { increment: 1 },
        fireScore: { increment: 1 },
      },
    });
  }

  async findDraftsByAuthorId(authorId: string): Promise<any[]> {
    return this.prisma.idea.findMany({
      where: { authorId, status: 'DRAFT', deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        problem: true,
        solution: true,
        status: true,
        impactArea: true,
        improvementType: true,
        effortLevel: true,
        isAnonymous: true,
        createdAt: true,
        updatedAt: true,
        challengeId: true,
        challenge: {
          select: {
            id: true,
            title: true,
            status: true,
            facultyId: true,
            faculty: { select: { id: true, name: true } },
          },
        },
        tags: {
          select: { tag: { select: { name: true } } },
        },
      },
    });
  }

  async softDeleteDraft(id: string): Promise<Idea> {
    return this.prisma.idea.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findByAuthorId(authorId: string): Promise<any[]> {
    return this.prisma.idea.findMany({
      where: { authorId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        problem: true,
        solution: true,
        status: true,
        likesCount: true,
        goodCount: true,
        futureCount: true,
        complexCount: true,
        fireScore: true,
        commentsCount: true,
        favoritesCount: true,
        isAnonymous: true,
        multimediaLinks: true,
        createdAt: true,
        updatedAt: true,
        authorId: true,
        challengeId: true,
        finalScore: true,
        challenge: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });
  }

  async findFavoritedByUser(userId: string): Promise<Idea[]> {
    const reactions = await this.prisma.ideaReaction.findMany({
      where: { userId, type: 'FAVORITE' },
      orderBy: { createdAt: 'desc' },
      include: {
        idea: {
          include: {
            author: {
              select: {
                id: true,
                displayName: true,
                nickname: true,
                email: true,
                phone: true,
                role: true,
                studentProfile: {
                  select: {
                    facultyId: true,
                    faculty: { select: { name: true } },
                  },
                },
              },
            },
            challenge: { select: { id: true, title: true, status: true } },
            reactions: { where: { userId, type: 'LIKE' } },
          },
        },
      },
    });

    return reactions.map((reaction) => {
      const { reactions: userReactions, ...ideaRest } = reaction.idea as any;
      return {
        ...ideaRest,
        hasVoted: Array.isArray(userReactions) && userReactions.length > 0,
        hasFavorited: true,
      };
    });
  }
}
