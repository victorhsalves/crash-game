import { beforeAll } from "bun:test";
import { assertServicesHealthy } from "./helpers/http.helper";

beforeAll(async () => {
  await assertServicesHealthy();
});
