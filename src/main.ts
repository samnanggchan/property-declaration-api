import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  const port = process.env.PORT ?? 3003;
  await app.listen(port);
  console.log(`Property declaration API is running on port ${port}`);
}
void bootstrap();
