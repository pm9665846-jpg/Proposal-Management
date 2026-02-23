import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env (Next.js loads .env.production automatically in production)
config({ path: path.resolve(__dirname, ".env") });

// Build DATABASE_URL from MYSQL_* if not set
if (!process.env.DATABASE_URL && process.env.MYSQL_HOST) {
  const user = encodeURIComponent(process.env.MYSQL_USER || "");
  const password = encodeURIComponent(process.env.MYSQL_PASSWORD || "");
  const host = process.env.MYSQL_HOST;
  const port = process.env.MYSQL_PORT || "3306";
  const database = process.env.MYSQL_DATABASE || "proposal_management";
  process.env.DATABASE_URL = `mysql://${user}:${password}@${host}:${port}/${database}`;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
};

export default nextConfig;
