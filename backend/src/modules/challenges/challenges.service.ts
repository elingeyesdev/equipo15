import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Challenge } from './entities/challenge.schema';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { ChallengeStatus } from './entities/challenge.status';
import { ChallengeAccess } from './entities/challenge-access.schema';

@Injectable()
export class ChallengesService {
  constructor(
    @InjectModel(Challenge.name) private challengeModel: Model<Challenge>,
    @InjectModel(ChallengeAccess.name) private challengeAccessModel: Model<ChallengeAccess>,
  ) {}

  async create(createChallengeDto: CreateChallengeDto): Promise<Challenge> {
    const newChallenge = new this.challengeModel(createChallengeDto);

    if (newChallenge.isPrivate) {
      newChallenge.accessToken = uuidv4();
    }

    return newChallenge.save();
  }

  async findAllPublic(): Promise<Challenge[]> {
    return this.challengeModel
      .find({
        isPrivate: false,
        status: ChallengeStatus.ACTIVE,
      })
      .populate('companyId', 'name')
      .sort({ startDate: -1 })
      .exec();
  }

  async findPrivateByToken(token: string): Promise<Challenge> {
    const challenge = await this.challengeModel
      .findOne({ accessToken: token, isPrivate: true })
      .populate('companyId', 'name')
      .exec();

    if (!challenge) {
      throw new NotFoundException('El reto privado no existe o el token es inválido');
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
}
