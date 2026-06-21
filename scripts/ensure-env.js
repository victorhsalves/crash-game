const { copyFileSync, existsSync } = require("node:fs");

const targets = ["services/games/.env", "services/wallets/.env"];

for (const envPath of targets) {
  if (existsSync(envPath)) continue;

  const examplePath = `${envPath}.example`;
  if (!existsSync(examplePath)) {
    console.error(`Missing ${examplePath}`);
    process.exit(1);
  }

  copyFileSync(examplePath, envPath);
  console.log(`Created ${envPath} from ${examplePath}`);
}
