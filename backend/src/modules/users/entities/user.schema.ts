import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  firebaseUid: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  displayName: string;

  @Prop({ 
    type: String, 
    enum: ['student', 'judge', 'admin'], 
    default: 'student' 
  })
  role: string;

  @Prop()
  fcmToken?: string;

  @Prop({ default: 0 })
  totalPoints: number;

  @Prop()
  career?: string;

  @Prop()
  specialty?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
