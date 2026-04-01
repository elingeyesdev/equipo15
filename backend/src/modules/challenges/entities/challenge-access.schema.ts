import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ChallengeAccess extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Challenge', required: true })
  challengeId: Types.ObjectId;
}

export const ChallengeAccessSchema = SchemaFactory.createForClass(ChallengeAccess);
ChallengeAccessSchema.index({ userId: 1, challengeId: 1 }, { unique: true });
