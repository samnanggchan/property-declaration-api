import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DeclarationsModule } from './declarations/declarations.module';
import { InheritanceRequestsModule } from './inheritance-requests/inheritance-requests.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ParcelsModule } from './parcels/parcels.module';
import { TransferApplicationsModule } from './transfer-applications/transfer-applications.module';

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    // ObserveModule.forRoot({
    //   appKey: 'YOUR_APP_KEY',
    //   appSecret: 'YOUR_APP_SECRET',
    //   serviceId: 'property-declaration-api',
    // }),
    DeclarationsModule,
    InheritanceRequestsModule,
    AuthModule,
    UsersModule,
    ParcelsModule,
    TransferApplicationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
