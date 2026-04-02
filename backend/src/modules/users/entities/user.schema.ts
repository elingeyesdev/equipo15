import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  firebaseUid: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  displayName: string;

  @Prop()
  bio?: string;

  @Prop()
  avatarUrl?: string;

  @Prop({ type: Types.ObjectId, ref: 'Role' })
  roleId: Types.ObjectId;

  @Prop()
  fcmToken?: string;

  @Prop({ default: 0 })
  totalPoints: number;

  @Prop()
  career?: string;

  @Prop()
  specialty?: string;

  @Prop({ type: Number })
  facultyId?: number;

  @Prop({ type: Boolean, default: false })
  isFacultyVerified: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
