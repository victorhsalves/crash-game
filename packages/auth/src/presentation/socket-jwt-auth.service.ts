import { Injectable } from "@nestjs/common";
import passport from "passport";
import type { AuthenticatedUser } from "../application/authenticated-user.interface";
import {
  createAuthorizationRequest,
  type SocketHandshakeLike,
} from "../infrastructure/ws-jwt-extractor";

@Injectable()
export class SocketJwtAuthService {
  public authenticateHandshake(handshake: SocketHandshakeLike): Promise<AuthenticatedUser | null> {
    const request = createAuthorizationRequest(handshake);

    return new Promise((resolve) => {
      passport.authenticate(
        "jwt",
        { session: false },
        (error: Error | null, user: AuthenticatedUser | false) => {
          if (error !== null || user === false) {
            resolve(null);
            return;
          }

          resolve(user);
        },
      )(request);
    });
  }
}
