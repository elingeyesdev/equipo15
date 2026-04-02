import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ChallengeStatus } from './challenge.status';

@Schema({ timestamps: true })
export class Challenge extends Document {
  @Prop({ required: true, index: true, trim: true })
  title: string;

  @Prop()
  problemDescription: string;

  @Prop()
  companyContext: string;

  @Prop()
  participationRules: string;

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop()
  publicationDate: Date;

  @Prop({ default: false })
  isPrivate: boolean;

  @Prop({ unique: true, sparse: true })
  accessToken?: string;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: false })
  companyId: Types.ObjectId;

  @Prop({ type: Number, required: false })
  facultyId: number;

  @Prop({
    type: String,
    enum: ChallengeStatus,
    default: ChallengeStatus.DRAFT,
  })
  status: ChallengeStatus;
}

export const ChallengeSchema = SchemaFactory.createForClass(Challenge);

ChallengeSchema.pre('save', async function () {
  if (this.endDate && this.startDate && this.endDate <= this.startDate) {
    throw new Error('La fecha de cierre no puede ser anterior o igual a la de inicio.');
  }
});
