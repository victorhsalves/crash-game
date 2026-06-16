import { type DynamicModule, Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./infrastructure/jwt.strategy";
import { AuthController } from "./presentation/auth.controller";
import { JwtAuthGuard } from "./presentation/jwt-auth.guard";

@Module({})
export class AuthModule {
  public static forRoot(): DynamicModule {
    return {
      module: AuthModule,
      imports: [PassportModule.register({ defaultStrategy: "jwt" })],
      controllers: [AuthController],
      providers: [JwtStrategy, JwtAuthGuard],
      exports: [PassportModule, JwtAuthGuard],
    };
  }
}
