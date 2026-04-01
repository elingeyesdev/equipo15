import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'borradores', timestamps: true })
export class DraftIdea extends Document {
  @Prop({ trim: true })
  title?: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ enum: ['draft'], default: 'draft' })
  status: string;

  @Prop({ default: false })
  isAnonymous: boolean;
}

export const DraftIdeaSchema = SchemaFactory.createForClass(DraftIdea);
