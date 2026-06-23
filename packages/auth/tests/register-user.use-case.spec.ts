import { beforeEach, describe, expect, it, mock } from "bun:test";
import { RegisterUserUseCase } from "../src/application/use-cases/register-user/register-user.use-case";
import type { KeycloakAdminClient } from "../src/infrastructure/keycloak-admin.client";
import { UserAlreadyExistsError } from "../src/application/errors/user-already-exists.error";

describe("RegisterUserUseCase", () => {
  const keycloakAdminClient = {
    createUser: mock(() => Promise.resolve()),
  } as unknown as KeycloakAdminClient;

  beforeEach(() => {
    keycloakAdminClient.createUser = mock(() => Promise.resolve());
  });

  it("delegates user creation to Keycloak admin client", async () => {
    const useCase = new RegisterUserUseCase(keycloakAdminClient);

    await useCase.execute({
      username: "newplayer",
      email: "newplayer@crash-game.dev",
      password: "password123",
    });

    expect(keycloakAdminClient.createUser).toHaveBeenCalledWith({
      username: "newplayer",
      email: "newplayer@crash-game.dev",
      password: "password123",
    });
  });

  it("propagates user already exists errors", async () => {
    keycloakAdminClient.createUser = mock(() => Promise.reject(new UserAlreadyExistsError()));
    const useCase = new RegisterUserUseCase(keycloakAdminClient);

    await expect(
      useCase.execute({
        username: "player",
        email: "player@crash-game.dev",
        password: "password123",
      }),
    ).rejects.toThrow(UserAlreadyExistsError);
  });
});
