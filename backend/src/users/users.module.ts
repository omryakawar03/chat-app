import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './users.service';
import { UserController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [ ChatModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema }
    ]),forwardRef(() => ChatModule),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],  // IMPORTANT
})
export class UserModule {}
