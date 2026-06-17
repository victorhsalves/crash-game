import { type DynamicModule, Global, Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./infrastructure/jwt.strategy";
import { AuthController } from "./presentation/auth.controller";
import { JwtAuthGuard } from "./presentation/jwt-auth.guard";
import { SocketJwtAuthService } from "./presentation/socket-jwt-auth.service";
import { WsJwtGuard } from "./presentation/ws-jwt.guard";

@Global()
@Module({})
export class AuthModule {
  public static forRoot(): DynamicModule {
    return {
      module: AuthModule,
      global: true,
      imports: [PassportModule.register({ defaultStrategy: "jwt" })],
      controllers: [AuthController],
      providers: [JwtStrategy, JwtAuthGuard, WsJwtGuard, SocketJwtAuthService],
      exports: [PassportModule, JwtAuthGuard, WsJwtGuard, SocketJwtAuthService],
    };
  }
}
