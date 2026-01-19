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
async findByIdWithPassword(id: string) {
  return this.userModel.findById(id); // password INCLUDED
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


async updateProfile(userId: string, data: { bio?: string; avatar?: string }) {
  return this.userModel.findByIdAndUpdate(
    userId,
    data,
    { new: true }
  );
}

async changeUsername(userId: string, username: string) {
  const exists = await this.userModel.findOne({ username });
  if (exists) throw new Error("Username already taken");

  return this.userModel.findByIdAndUpdate(
    userId,
    { username },
    { new: true }
  );
}

async changePassword(userId: string, newPassword: string) {
  return this.userModel.findByIdAndUpdate(userId, {
    password: newPassword,
  });
}
async deleteUser(userId: string) {
  return this.userModel.findByIdAndDelete(userId);
}
async findById(id: string) {
  return this.userModel.findById(id).select("-password");
}
  async updateRefreshToken(userId: string, token: string | null) {
  return this.userModel.findByIdAndUpdate(userId, {
    refreshToken: token,
  });
}
}
