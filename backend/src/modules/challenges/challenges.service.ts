import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Challenge } from './entities/challenge.schema';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { ChallengeStatus } from './entities/challenge.status';
import { ChallengeAccess } from './entities/challenge-access.schema';
import { User } from '../users/entities/user.schema';
import { Idea } from '../ideas/entities/idea.schema';

@Injectable()
export class ChallengesService {
  constructor(
    @InjectModel(Challenge.name) private challengeModel: Model<Challenge>,
    @InjectModel(ChallengeAccess.name) private challengeAccessModel: Model<ChallengeAccess>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Idea.name) private ideaModel: Model<Idea>,
  ) {}

  async create(createChallengeDto: CreateChallengeDto): Promise<Challenge> {
    const { title, startDate, endDate, isPrivate, status, ...rest } = createChallengeDto;
    
    const cleanData: any = {
      title,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      publicationDate: new Date(),
      isPrivate: !!isPrivate,
      status: status || ChallengeStatus.DRAFT,
    };

    Object.keys(rest).forEach(key => {
      if (rest[key] && rest[key] !== '') {
        cleanData[key] = rest[key];
      }
    });

    const newChallenge = new this.challengeModel(cleanData);

    if (newChallenge.isPrivate) {
      newChallenge.set('accessToken', uuidv4());
    } else {
      newChallenge.set('accessToken', undefined);
      newChallenge.unmarkModified('accessToken');
    }

    const savedChallenge = await newChallenge.save();
    return savedChallenge.toObject();
  }

  async findAllPublic(): Promise<any[]> {
    const serverDate = new Date();

    await this.challengeModel.updateMany(
      { status: ChallengeStatus.ACTIVE, endDate: { $lt: serverDate } },
      { $set: { status: ChallengeStatus.FINISHED } }
    );

    return this.challengeModel.aggregate([
      {
        $match: {
          isPrivate: false,
          status: ChallengeStatus.ACTIVE,
        }
      },
      {
        $lookup: {
          from: 'ideas',
          localField: '_id',
          foreignField: 'challengeId',
          as: 'ideas'
        }
      },
      {
        $addFields: {
          ideasCount: { $size: '$ideas' },
          likesCount: { $sum: '$ideas.likesCount' }
        }
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'companyId',
          foreignField: '_id',
          as: 'company'
        }
      },
      {
        $unwind: { path: '$company', preserveNullAndEmptyArrays: true }
      },
      { $sort: { startDate: -1 } }
    ]);
  }

  async findPrivateByToken(token: string): Promise<Challenge> {
    const serverDate = new Date();

    const challenge = await this.challengeModel
      .findOne({ accessToken: token, isPrivate: true })
      .populate('companyId', 'name')
      .exec();

    if (!challenge) {
      throw new NotFoundException('El reto privado no existe o el token es inválido');
    }

    if (challenge.endDate < serverDate && challenge.status === ChallengeStatus.ACTIVE) {
      challenge.status = ChallengeStatus.FINISHED;
      await challenge.save();
    }

    return challenge;
  }

  async grantAccess(userId: string, challengeId: string): Promise<void> {
    await this.challengeAccessModel.updateOne(
      { 
        userId: new Types.ObjectId(userId), 
        challengeId: new Types.ObjectId(challengeId) 
      },
      { $set: { userId, challengeId } },
      { upsert: true }
    );
  }

  async getStats(challengeId: string) {
    const stats = await this.ideaModel.aggregate([
      { $match: { challengeId: new Types.ObjectId(challengeId) } },
      {
        $group: {
          _id: '$challengeId',
          totalIdeas: { $sum: 1 },
          totalLikes: { $sum: '$likesCount' },
        },
      },
    ]);

    return stats[0] || { totalIdeas: 0, totalLikes: 0 };
  }

  async getGlobalStats() {
    const topLeaders = await this.userModel
      .find({ roleId: { $exists: true } }) // Solo usuarios con rol
      .sort({ totalPoints: -1 })
      .limit(5)
      .select('displayName totalPoints')
      .exec();

    const facultyStats = await this.userModel.aggregate([
      { $group: { _id: '$facultyId', totalPoints: { $sum: '$totalPoints' } } },
      { $sort: { totalPoints: -1 } },
    ]);

    const facultiesMap: Record<number, string> = {
      1: 'Ingeniería',
      2: 'Ciencias',
      3: 'Humanidades',
      4: 'Medicina',
      5: 'Derecho'
    };

    const topFacultades = facultyStats
      .filter(f => f._id !== null)
      .map(f => ({
        name: facultiesMap[f._id] || `Facultad ${f._id}`,
        likes: f.totalPoints
      }));

    return {
      topLeaders: topLeaders.map(u => ({ name: u.displayName, ideas: u.totalPoints })), // Se usan puntos como proxy de actividad para el dashboard visual
      topFacultades,
    };
  }

  async update(id: string, updateChallengeDto: any): Promise<Challenge> {
    const challenge = await this.challengeModel.findById(id).exec();

    if (!challenge) {
      throw new NotFoundException('El reto no existe');
    }

    const serverDate = new Date();
    const updatedData = { ...updateChallengeDto };

    if (updatedData.endDate) {
      const newEndDate = new Date(updatedData.endDate);
      if (newEndDate > serverDate && challenge.status === ChallengeStatus.FINISHED) {
        updatedData.status = ChallengeStatus.ACTIVE;
      }
    }

    return this.challengeModel
      .findByIdAndUpdate(id, { $set: updatedData }, { new: true })
      .exec() as Promise<Challenge>;
  }
}
