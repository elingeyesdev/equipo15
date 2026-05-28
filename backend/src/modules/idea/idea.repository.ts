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
                select: { facultyId: true, faculty: { select: { name: true } } },
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

  async findPublic(
    skip?: number,
    take?: number,
    challengeId?: string,
    userId?: string,
    search?: string,
    sort?: 'newest' | 'oldest' | 'likes' | 'comments',
  ): Promise<{ data: IdeaWithVoteStatus[]; total: number }> {
    const where: any = { status: 'PUBLISHED' };
    if (challengeId) where.challengeId = challengeId;

    if (search && search.trim().length > 0) {
      const keyword = search.trim();
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { problem: { contains: keyword, mode: 'insensitive' } },
        { solution: { contains: keyword, mode: 'insensitive' } },
      ];
    }

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

    const data = await this.prisma.idea.findMany({
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
            studentProfile: {
              select: { facultyId: true, faculty: { select: { name: true } } },
            },
          },
        },
        challenge: { select: { status: true } },
        ...(userId
          ? {
              reactions: { where: { userId }, select: { id: true, type: true } },
            }
          : {}),
      },
    });

    const enriched: IdeaWithVoteStatus[] = data.map((idea) => {
      const { reactions, ...rest } = idea as any;
      return {
        ...rest,
        hasVoted: Array.isArray(reactions) && reactions.some((r: any) => r.type === 'LIKE'),
        hasFavorited: Array.isArray(reactions) && reactions.some((r: any) => r.type === 'FAVORITE'),
      } as IdeaWithVoteStatus;
    });

    return { data: enriched, total: enriched.length };
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

  async checkUserLike(ideaId: string, userId: string): Promise<string | null> {
    const reaction = await this.prisma.ideaReaction.findUnique({
      where: { uq_reaction_per_type: { ideaId, userId, type: 'LIKE' } },
      select: { reactionType: true },
    });
    return reaction ? reaction.reactionType : null;
  }

  async registerLikeAndIncrement(
    ideaId: string,
    userId: string,
    reactionType: string,
  ): Promise<Idea> {
    const fireDelta = reactionType === 'COMPLEX' ? 0.5 : 2;
    const countField = reactionType === 'GOOD' ? 'goodCount' : reactionType === 'FUTURE' ? 'futureCount' : 'complexCount';

    const [, updated] = await this.prisma.$transaction([
      this.prisma.ideaReaction.create({
        data: { ideaId, userId, type: 'LIKE', reactionType },
      }),
      this.prisma.idea.update({
        where: { id: ideaId },
        data: {
          likesCount: { increment: 1 },
          [countField]: { increment: 1 },
          fireScore: { increment: fireDelta },
        },
      }),
    ]);
    return updated;
  }

  async updateLikeReaction(
    ideaId: string,
    userId: string,
    oldReaction: string,
    newReaction: string,
  ): Promise<Idea> {
    const oldField = oldReaction === 'GOOD' ? 'goodCount' : oldReaction === 'FUTURE' ? 'futureCount' : 'complexCount';
    const newField = newReaction === 'GOOD' ? 'goodCount' : newReaction === 'FUTURE' ? 'futureCount' : 'complexCount';

    const oldFire = oldReaction === 'COMPLEX' ? 0.5 : 2;
    const newFire = newReaction === 'COMPLEX' ? 0.5 : 2;
    const fireDelta = newFire - oldFire;

    const [, updated] = await this.prisma.$transaction([
      this.prisma.ideaReaction.update({
        where: { uq_reaction_per_type: { ideaId, userId, type: 'LIKE' } },
        data: { reactionType: newReaction },
      }),
      this.prisma.idea.update({
        where: { id: ideaId },
        data: {
          [oldField]: { decrement: 1 },
          [newField]: { increment: 1 },
          fireScore: { increment: fireDelta },
        },
      }),
    ]);
    return updated;
  }

  async removeLikeAndDecrement(ideaId: string, userId: string, reactionType: string): Promise<Idea> {
    const fireDelta = reactionType === 'COMPLEX' ? -0.5 : -2;
    const countField = reactionType === 'GOOD' ? 'goodCount' : reactionType === 'FUTURE' ? 'futureCount' : 'complexCount';

    const [, updated] = await this.prisma.$transaction([
      this.prisma.ideaReaction.delete({
        where: { uq_reaction_per_type: { ideaId, userId, type: 'LIKE' } },
      }),
      this.prisma.idea.update({
        where: { id: ideaId },
        data: {
          likesCount: { decrement: 1 },
          [countField]: { decrement: 1 },
          fireScore: { increment: fireDelta },
        },
      }),
    ]);
    return updated;
  }

  async checkUserFavorite(ideaId: string, userId: string): Promise<boolean> {
    const count = await this.prisma.ideaReaction.count({
      where: { ideaId, userId, type: 'FAVORITE' },
    });
    return count > 0;
  }

  async registerFavorite(ideaId: string, userId: string): Promise<void> {
    await this.prisma.ideaReaction.create({
      data: { ideaId, userId, type: 'FAVORITE' },
    });
  }

  async removeFavorite(ideaId: string, userId: string): Promise<void> {
    await this.prisma.ideaReaction.delete({
      where: { uq_reaction_per_type: { ideaId, userId, type: 'FAVORITE' } },
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

  async findByAuthorId(authorId: string): Promise<any[]> {
    return this.prisma.idea.findMany({
      where: { authorId },
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
                  select: { facultyId: true, faculty: { select: { name: true } } },
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
