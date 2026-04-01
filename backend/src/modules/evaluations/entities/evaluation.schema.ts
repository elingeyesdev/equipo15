import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Evaluation extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Idea', required: true })
  ideaId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  judgeId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 10 })
  score: number;

  @Prop()
  feedback?: string;
}

export const EvaluationSchema = SchemaFactory.createForClass(Evaluation);
