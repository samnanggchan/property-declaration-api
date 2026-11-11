import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TransferApplicationsService } from './transfer-applications.service';
import { TransferApplicationsController } from './transfer-applications.controller';

@Module({
  imports: [PrismaModule],
  controllers: [TransferApplicationsController],
  providers: [TransferApplicationsService],
  exports: [TransferApplicationsService],
})
export class TransferApplicationsModule {}

