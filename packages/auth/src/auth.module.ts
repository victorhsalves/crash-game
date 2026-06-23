import { type DynamicModule, Global, Module, type Provider } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { PassportModule } from "@nestjs/passport";
import type { AuthModuleOptions } from "./auth.module-options";
import { RegisterUserUseCase } from "./application/use-cases/register-user/register-user.use-case";
import { KeycloakAdminClient } from "./infrastructure/keycloak-admin.client";
import { JwtStrategy } from "./infrastructure/jwt.strategy";
import { AuthController } from "./presentation/auth.controller";
import { AuthRegistrationController } from "./presentation/auth-registration.controller";
import { AuthApplicationExceptionFilter } from "./presentation/filters/auth-application-exception.filter";
import { JwtAuthGuard } from "./presentation/jwt-auth.guard";
import { SocketJwtAuthService } from "./presentation/socket-jwt-auth.service";
import { WsJwtGuard } from "./presentation/ws-jwt.guard";

@Global()
@Module({})
export class AuthModule {
  public static forRoot(options: AuthModuleOptions = {}): DynamicModule {
    const providers: Provider[] = [
      JwtStrategy,
      JwtAuthGuard,
      WsJwtGuard,
      SocketJwtAuthService,
    ];
    const controllers = [AuthController];

    if (options.enableUserRegistration) {
      providers.push(
        KeycloakAdminClient,
        RegisterUserUseCase,
        {
          provide: APP_FILTER,
          useClass: AuthApplicationExceptionFilter,
        },
      );
      controllers.push(AuthRegistrationController);
    }

    return {
      module: AuthModule,
      global: true,
      imports: [PassportModule.register({ defaultStrategy: "jwt" })],
      controllers,
      providers,
      exports: [PassportModule, JwtAuthGuard, WsJwtGuard, SocketJwtAuthService],
    };
  }
}
