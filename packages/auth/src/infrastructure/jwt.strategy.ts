import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { passportJwtSecret } from "jwks-rsa";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { AuthenticatedUser } from "../application/authenticated-user.interface";
import { buildAuthConfig } from "./auth-config";

interface KeycloakJwtPayload {
  sub?: string;
  preferred_username?: string;
  email?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  public constructor() {
    const config = buildAuthConfig();

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ["RS256"],
      issuer: config.issuer,
      audience: config.audience,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: config.jwksUri,
      }),
    });
  }

  public validate(payload: KeycloakJwtPayload): AuthenticatedUser {
    if (!payload.sub || !payload.preferred_username) {
      throw new UnauthorizedException("Token is missing required claims.");
    }

    return {
      id: payload.sub,
      username: payload.preferred_username,
      email: payload.email,
    };
  }
}
