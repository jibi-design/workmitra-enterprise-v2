/** Print DATABASE_URL host/user/db only — never password. */
import { readFileSync } from "node:fs";

const text = readFileSync(".env", "utf8");
let url = "";
for (const line of text.split(/\r?\n/)) {
  if (line.startsWith("DATABASE_URL=")) {
    url = line.slice("DATABASE_URL=".length).trim();
    if (
      (url.startsWith('"') && url.endsWith('"')) ||
      (url.startsWith("'") && url.endsWith("'"))
    ) {
      url = url.slice(1, -1);
    }
    break;
  }
}

const normalized = url.replace(/^postgresql:/i, "postgres:");
const u = new URL(normalized);
console.log(`db_host=${u.hostname}`);
console.log(`db_port=${u.port || "5432"}`);
console.log(`db_user=${decodeURIComponent(u.username)}`);
console.log(`db_name=${u.pathname.replace(/^\//, "").split("?")[0]}`);
console.log(`has_password=${Boolean(u.password)}`);
