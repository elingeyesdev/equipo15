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
    const newChallenge = new this.challengeModel({
      ...createChallengeDto,
      status: ChallengeStatus.DRAFT,
    });

    if (newChallenge.isPrivate) {
      newChallenge.accessToken = uuidv4();
    }

    return newChallenge.save();
  }

  async findAllPublic(): Promise<Challenge[]> {
    const serverDate = new Date();

    await this.challengeModel.updateMany(
      { status: ChallengeStatus.ACTIVE, endDate: { $lt: serverDate } },
      { $set: { status: ChallengeStatus.FINISHED } }
    );

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
