import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
async function bootstrap() {
  
  const app = await NestFactory.create(AppModule );
  await app.listen(process.env.PORT ?? 4000);
   app.enableCors({
    origin: "http://localhost:3000",
    credentials: true,
  });
  app.use(helmet());
   app.use(cookieParser());

}
bootstrap();
