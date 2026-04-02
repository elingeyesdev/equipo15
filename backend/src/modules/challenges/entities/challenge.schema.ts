import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ChallengeStatus } from './challenge.status';

@Schema({ timestamps: true })
export class Challenge extends Document {
  @Prop({ required: true, index: true, trim: true })
  title: string;

  @Prop({ required: true })
  problemDescription: string;

  @Prop({ required: true })
  companyContext: string;

  @Prop({ required: true })
  participationRules: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  publicationDate: Date;

  @Prop({ default: false })
  isPrivate: boolean;

  @Prop({ unique: true, sparse: true })
  accessToken: string;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: false })
  companyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Faculty', required: false })
  facultyId: Types.ObjectId;

  @Prop({
    type: String,
    enum: ChallengeStatus,
    default: ChallengeStatus.DRAFT,
  })
  status: ChallengeStatus;
}

export const ChallengeSchema = SchemaFactory.createForClass(Challenge);

ChallengeSchema.pre('save', function (next: any) {
  if (this.endDate <= this.startDate) {
    return next(new Error('La fecha de cierre no puede ser anterior o igual a la de inicio.'));
  }
  next();
});
