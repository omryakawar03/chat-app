import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [MongooseModule.forRoot('mongodb+srv://omryakawar:password01@cluster0.g6jqkpa.mongodb.net/chat-app?appName=Cluster0'), AuthModule,
    ConfigModule.forRoot({ isGlobal: true , envFilePath: '.env' }),

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
