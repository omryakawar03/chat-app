import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './schemas/message.schema';
import { Model } from 'mongoose';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
  ) {}

  async saveMessage(data: any) {
    return this.messageModel.create({
      ...data,
      createdAt: new Date(),
      delivered: true,
      seen: false,
    });
  }

  async getMessages(conversationId: string) {
  return this.messageModel
    .find({ conversationId })
    .sort({ createdAt: 1 });
}

  async markMessagesAsSeen(roomId: string, userId: string) {
    await this.messageModel.updateMany(
      {
        roomId,
        sender: { $ne: userId },
        seen: false,
      },
      { $set: { seen: true } }
    );
  }
}
