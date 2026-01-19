import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class User extends Document {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  isOnline: boolean;

  @Prop({ type: Date, default: null })
  lastSeen: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
