const { copyFileSync, existsSync } = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");

function ensureEnv(targetRelativePath, exampleRelativePath) {
  const envPath = path.join(rootDir, targetRelativePath);
  if (existsSync(envPath)) return;

  const examplePath = path.join(rootDir, exampleRelativePath);
  if (!existsSync(examplePath)) {
    console.error(`Missing ${exampleRelativePath}`);
    process.exit(1);
  }

  copyFileSync(examplePath, envPath);
  console.log(`Created ${targetRelativePath} from ${exampleRelativePath}`);
}

ensureEnv(".env", ".env.example");
ensureEnv("services/games/.env", "services/games/.env.example");
ensureEnv("services/wallets/.env", "services/wallets/.env.example");
ensureEnv("frontend/.env", "frontend/.env.example");

console.log("Para dev local, edite .env e defina PUBLIC_HOST=localhost antes do docker compose up --build.");
