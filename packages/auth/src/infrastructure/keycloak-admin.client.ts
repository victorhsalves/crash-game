import { Injectable } from "@nestjs/common";
import { InvalidRegistrationError } from "../application/errors/invalid-registration.error";
import { RegistrationFailedError } from "../application/errors/registration-failed.error";
import { UserAlreadyExistsError } from "../application/errors/user-already-exists.error";
import { buildKeycloakAdminConfig, type KeycloakAdminConfig } from "./keycloak-admin.config";

export interface CreateKeycloakUserInput {
  username: string;
  email: string;
  password: string;
}

interface AdminTokenCache {
  accessToken: string;
  expiresAt: number;
}

@Injectable()
export class KeycloakAdminClient {
  private readonly config: KeycloakAdminConfig;
  private tokenCache: AdminTokenCache | null = null;

  public constructor() {
    this.config = buildKeycloakAdminConfig();
  }

  public async createUser(input: CreateKeycloakUserInput): Promise<void> {
    const adminToken = await this.getAdminToken();
    const response = await fetch(this.usersUrl(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(this.buildCreateUserBody(input)),
    });

    if (response.status === 409) {
      throw new UserAlreadyExistsError();
    }

    if (response.status === 400) {
      const message = await response.text().catch(() => "");
      throw new InvalidRegistrationError(message || "Dados de registro invalidos.");
    }

    if (!response.ok) {
      const message = await response.text().catch(() => response.statusText);
      throw new RegistrationFailedError(message || "Falha ao registrar usuario.");
    }

    const userId = this.extractUserId(response.headers.get("Location"));

    if (userId === null) {
      throw new RegistrationFailedError("Falha ao obter usuario criado no Keycloak.");
    }

    await this.finalizeUserSetup(adminToken, userId, input);
  }

  private buildCreateUserBody(input: CreateKeycloakUserInput): Record<string, unknown> {
    return {
      username: input.username,
      email: input.email,
      firstName: input.username,
      lastName: "Player",
      enabled: true,
      emailVerified: true,
      requiredActions: [],
      credentials: [
        {
          type: "password",
          value: input.password,
          temporary: false,
        },
      ],
    };
  }

  private async finalizeUserSetup(
    adminToken: string,
    userId: string,
    input: CreateKeycloakUserInput,
  ): Promise<void> {
    await this.resetPassword(adminToken, userId, input.password);

    const updateResponse = await fetch(this.userUrl(userId), {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: input.username,
        email: input.email,
        firstName: input.username,
        lastName: "Player",
        enabled: true,
        emailVerified: true,
        requiredActions: [],
      }),
    });

    if (!updateResponse.ok) {
      const message = await updateResponse.text().catch(() => updateResponse.statusText);
      throw new RegistrationFailedError(message || "Falha ao finalizar cadastro no Keycloak.");
    }
  }

  private async resetPassword(
    adminToken: string,
    userId: string,
    password: string,
  ): Promise<void> {
    const response = await fetch(`${this.userUrl(userId)}/reset-password`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "password",
        value: password,
        temporary: false,
      }),
    });

    if (!response.ok) {
      const message = await response.text().catch(() => response.statusText);
      throw new RegistrationFailedError(message || "Falha ao definir senha no Keycloak.");
    }
  }

  private extractUserId(location: string | null): string | null {
    if (!location) {
      return null;
    }

    const segments = location.split("/").filter(Boolean);
    return segments.at(-1) ?? null;
  }

  private usersUrl(): string {
    return `${this.config.adminUrl}/admin/realms/${this.config.userRealm}/users`;
  }

  private userUrl(userId: string): string {
    return `${this.usersUrl()}/${userId}`;
  }

  private async getAdminToken(): Promise<string> {
    if (this.tokenCache !== null && Date.now() < this.tokenCache.expiresAt) {
      return this.tokenCache.accessToken;
    }

    const body = new URLSearchParams({
      grant_type: "password",
      client_id: this.config.adminClientId,
      username: this.config.adminUsername,
      password: this.config.adminPassword,
    });

    const response = await fetch(
      `${this.config.adminUrl}/realms/${this.config.adminRealm}/protocol/openid-connect/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      },
    );

    if (!response.ok) {
      const message = await response.text().catch(() => response.statusText);
      throw new RegistrationFailedError(message || "Falha ao autenticar no Keycloak admin.");
    }

    const payload = (await response.json()) as {
      access_token: string;
      expires_in: number;
    };

    this.tokenCache = {
      accessToken: payload.access_token,
      expiresAt: Date.now() + payload.expires_in * 1000 - 10_000,
    };

    return payload.access_token;
  }
}
