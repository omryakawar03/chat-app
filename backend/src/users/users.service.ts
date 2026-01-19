import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(data: any) {
    return this.userModel.create(data);
  }

  async findByUsername(username: string) {
    return this.userModel.findOne({ username });
  }

  async setOnline(userId: string) {
    return this.userModel.findByIdAndUpdate(userId, {
      isOnline: true,
      lastSeen: null,
    });
  }

  async setOffline(userId: string) {
    return this.userModel.findByIdAndUpdate(userId, {
      isOnline: false,
      lastSeen: new Date(), // ✅ Date, not string
    });
  }

  async getAllUsers() {
    return this.userModel.find();
  }
}
