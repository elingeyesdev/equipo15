import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Evaluation } from './entities/evaluation.schema';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';

@Injectable()
export class EvaluationsService {
  constructor(@InjectModel(Evaluation.name) private evalModel: Model<Evaluation>) {}

  async create(createEvalDto: CreateEvaluationDto): Promise<Evaluation> {
    const evaluation = new this.evalModel(createEvalDto);
    return evaluation.save();
  }

  async findByIdea(ideaId: string) {
    return this.evalModel.find({ ideaId }).populate('judgeId', 'displayName specialty').exec();
  }
}
