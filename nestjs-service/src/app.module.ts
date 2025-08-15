import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ServeStaticModule } from "@nestjs/serve-static";
import { ThrottlerModule } from "@nestjs/throttler";
import { join } from "path";
import { CampaignModule } from "./campaign/campaign.module";
import { Campaign } from "./campaign/entities/campaign.entity";
import { User } from "./user/entities/user.entity";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "./config/config.module";
import { ConfigService } from "./config/config.service";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { WebSocketModule } from "./websocket/websocket.module";

@Module({
  imports: [
    ConfigModule,
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 20,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'output'),
      serveRoot: '/output',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.postgresHost,
        port: configService.postgresPort,
        username: configService.postgresUser,
        password: configService.postgresPassword,
        database: configService.postgresDatabase,
        entities: [Campaign, User],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    CampaignModule,
    WebSocketModule,
  ],
})
export class AppModule {}

// dead letter queue