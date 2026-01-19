import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class Message extends Document {
  @Prop() text: string;
  @Prop() sender: string;
  @Prop() receiver: string;
  @Prop({ required: true }) conversationId: string;
  @Prop() createdAt: Date;
  @Prop({ default: false }) delivered: boolean;
  @Prop({ default: false }) seen: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
