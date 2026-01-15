import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Session extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  tokenHash: string;

  @Prop()
  userAgent: string;

  @Prop()
  ip: string;

  @Prop()
  expiresAt: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
