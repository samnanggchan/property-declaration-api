import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { InheritanceRequestsService } from './inheritance-requests.service';
import { InheritanceRequestsController } from './inheritance-requests.controller';

@Module({
  imports: [PrismaModule],
  controllers: [InheritanceRequestsController],
  providers: [InheritanceRequestsService],
  exports: [InheritanceRequestsService],
})
export class InheritanceRequestsModule {}
