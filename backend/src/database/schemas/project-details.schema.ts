import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ProjectDetails extends Document {
  @Prop({ required: true, unique: true })
  projectId: string;

  @Prop()
  description: string;

  @Prop([String])
  tags: string[];

  @Prop([String])
  multimediaLinks: string[];

  @Prop({ default: 0 })
  innovationScore: number;

  @Prop([{
    mentorId: String,
    feedback: String,
    date: { type: Date, default: Date.now }
  }])
  mentorshipHistory: any[];
}

export const ProjectDetailsSchema = SchemaFactory.createForClass(ProjectDetails);
