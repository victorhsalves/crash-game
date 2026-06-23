import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { InvalidRegistrationError } from "../src/application/errors/invalid-registration.error";
import { RegistrationFailedError } from "../src/application/errors/registration-failed.error";
import { UserAlreadyExistsError } from "../src/application/errors/user-already-exists.error";
import { KeycloakAdminClient } from "../src/infrastructure/keycloak-admin.client";

const originalFetch = globalThis.fetch;

describe("KeycloakAdminClient", () => {
  beforeEach(() => {
    process.env.KEYCLOAK_ISSUER = "http://localhost:8080/realms/crash-game";
    process.env.KEYCLOAK_ADMIN_URL = "http://keycloak:8080";
    process.env.KEYCLOAK_ADMIN_USERNAME = "admin";
    process.env.KEYCLOAK_ADMIN_PASSWORD = "admin";
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("finalizes created users with reset password and cleared required actions", async () => {
    const calls: Array<{ url: string; method?: string; body?: string }> = [];

    globalThis.fetch = mock(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? "GET";
      const body = typeof init?.body === "string" ? init.body : undefined;
      calls.push({ url, method, body });

      if (url.includes("/protocol/openid-connect/token")) {
        return new Response(JSON.stringify({ access_token: "admin-token", expires_in: 60 }), {
          status: 200,
        });
      }

      if (url.endsWith("/admin/realms/crash-game/users") && method === "POST") {
        return new Response(null, {
          status: 201,
          headers: { Location: "http://keycloak:8080/admin/realms/crash-game/users/user-123" },
        });
      }

      if (url.endsWith("/users/user-123/reset-password") && method === "PUT") {
        return new Response(null, { status: 204 });
      }

      if (url.endsWith("/users/user-123") && method === "PUT") {
        return new Response(null, { status: 204 });
      }

      throw new Error(`Unexpected fetch call: ${method} ${url}`);
    }) as typeof fetch;

    const client = new KeycloakAdminClient();

    await client.createUser({
      username: "newplayer",
      email: "newplayer@crash-game.dev",
      password: "password123",
    });

    expect(calls.some((call) => call.url.endsWith("/reset-password"))).toBe(true);

    const updateCall = calls.find((call) => call.url.endsWith("/users/user-123") && call.method === "PUT");
    expect(updateCall?.body).toContain('"requiredActions":[]');
    expect(updateCall?.body).toContain('"emailVerified":true');
  });

  it("maps 409 responses to UserAlreadyExistsError", async () => {
    globalThis.fetch = mock(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.includes("/protocol/openid-connect/token")) {
        return new Response(JSON.stringify({ access_token: "admin-token", expires_in: 60 }), {
          status: 200,
        });
      }

      if (url.includes("/admin/realms/crash-game/users") && init?.method === "POST") {
        return new Response("Conflict", { status: 409 });
      }

      throw new Error(`Unexpected fetch call: ${url}`);
    }) as typeof fetch;

    const client = new KeycloakAdminClient();

    await expect(
      client.createUser({
        username: "player",
        email: "player@crash-game.dev",
        password: "password123",
      }),
    ).rejects.toThrow(UserAlreadyExistsError);
  });

  it("maps 400 responses to InvalidRegistrationError", async () => {
    globalThis.fetch = mock(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.includes("/protocol/openid-connect/token")) {
        return new Response(JSON.stringify({ access_token: "admin-token", expires_in: 60 }), {
          status: 200,
        });
      }

      if (url.includes("/admin/realms/crash-game/users") && init?.method === "POST") {
        return new Response("Invalid password", { status: 400 });
      }

      throw new Error(`Unexpected fetch call: ${url}`);
    }) as typeof fetch;

    const client = new KeycloakAdminClient();

    await expect(
      client.createUser({
        username: "weak",
        email: "weak@crash-game.dev",
        password: "short",
      }),
    ).rejects.toThrow(InvalidRegistrationError);
  });

  it("maps admin token failures to RegistrationFailedError", async () => {
    globalThis.fetch = mock(async () => new Response("Unauthorized", { status: 401 })) as typeof fetch;

    const client = new KeycloakAdminClient();

    await expect(
      client.createUser({
        username: "newplayer",
        email: "newplayer@crash-game.dev",
        password: "password123",
      }),
    ).rejects.toThrow(RegistrationFailedError);
  });
});
