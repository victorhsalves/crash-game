import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { AuthenticatedUser } from "../application/authenticated-user.interface";
import { createAuthorizationRequest } from "../infrastructure/ws-jwt-extractor";

interface AuthorizationRequest {
  headers: { authorization: string };
  user?: AuthenticatedUser;
}

@Injectable()
export class WsJwtGuard extends AuthGuard("jwt") implements CanActivate {
  public getRequest(context: ExecutionContext): AuthorizationRequest {
    const client = context.switchToWs().getClient<{ handshake: Parameters<typeof createAuthorizationRequest>[0] }>();

    return createAuthorizationRequest(client.handshake);
  }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<{ data: { user?: AuthenticatedUser }; handshake: Parameters<typeof createAuthorizationRequest>[0] }>();
    const request = this.getRequest(context);
    const canActivate = await super.canActivate(context);

    if (canActivate && request.user !== undefined) {
      client.data.user = request.user;
    }

    return canActivate as boolean;
  }

  public handleRequest<TUser = AuthenticatedUser>(
    error: Error | null,
    user: TUser | false,
    _info: unknown,
    context: ExecutionContext,
  ): TUser {
    if (error !== null || user === false) {
      throw error ?? new UnauthorizedException("WebSocket authentication failed.");
    }

    const request = this.getRequest(context);
    request.user = user as AuthenticatedUser;

    return user;
  }
}
