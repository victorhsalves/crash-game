import { Injectable } from "@nestjs/common";
import { KeycloakAdminClient } from "../../../infrastructure/keycloak-admin.client";
import type { RegisterUserInput } from "./register-user.input";

@Injectable()
export class RegisterUserUseCase {
  public constructor(private readonly keycloakAdminClient: KeycloakAdminClient) {}

  public execute(input: RegisterUserInput): Promise<void> {
    return this.keycloakAdminClient.createUser(input);
  }
}
