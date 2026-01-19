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
  @Prop({ default: "" })
bio: string;

@Prop({ default: "" })
avatar: string;
@Prop()
refreshToken?:string;
}

export const UserSchema = SchemaFactory.createForClass(User);
