import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Idea } from './entities/idea.schema';
import { DraftIdea } from './entities/draft-idea.schema';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { CreateDraftIdeaDto } from './dto/create-draft-idea.dto';

@Injectable()
export class IdeasService {
  constructor(
    @InjectModel(Idea.name) private ideaModel: Model<Idea>,
    @InjectModel(DraftIdea.name) private draftIdeaModel: Model<DraftIdea>,
  ) {}

  async create(createIdeaDto: CreateIdeaDto): Promise<Idea> {
    const createdIdea = new this.ideaModel(createIdeaDto);
    return createdIdea.save();
  }

  async createDraft(createIdeaDraftDto: CreateDraftIdeaDto): Promise<DraftIdea> {
    const draftPayload = {
      ...createIdeaDraftDto,
      status: 'draft',
    };
    const createdDraft = new this.draftIdeaModel(draftPayload);
    return createdDraft.save();
  }

  async findAll() {
    return this.ideaModel.find().populate('author', 'displayName role').exec();
  }

  async updateStatus(id: string, status: string) {
    return this.ideaModel.findByIdAndUpdate(id, { status }, { new: true });
  }
}
