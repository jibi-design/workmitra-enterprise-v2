/**
 * Job Mitra — Paste Board Bridge
 * Phone (Tailscale) ↔ PC: prompts IN, Cursor reports OUT — one-tap copy on mobile.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PASTE_BOARD_PORT ?? 8765);
const DATA_FILE = path.join(__dirname, "paste-board-data.json");
const PUBLIC_DIR = path.join(__dirname, "public");

const defaultState = () => ({ in: "", out: "", updatedAt: Date.now() });

function readState() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return {
      in: parsed.in ?? "",
      out: parsed.out ?? "",
      updatedAt: parsed.updatedAt ?? Date.now(),
    };
  } catch {
    return defaultState();
  }
}

function writeState(next) {
  const payload = { ...next, updatedAt: Date.now() };
  fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), "utf8");
  return payload;
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${PORT}`);
  const pathname = url.pathname;

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  if (pathname === "/api/state" && req.method === "GET") {
    sendJson(res, 200, readState());
    return;
  }

  if ((pathname === "/api/in" || pathname === "/api/out") && req.method === "POST") {
    try {
      const raw = await readBody(req);
      const body = JSON.parse(raw);
      const text = typeof body.text === "string" ? body.text : "";
      const current = readState();
      const next =
        pathname === "/api/in"
          ? { in: text, out: current.out }
          : { in: current.in, out: text };
      sendJson(res, 200, writeState(next));
    } catch {
      sendJson(res, 400, { error: "Invalid JSON" });
    }
    return;
  }

  if (pathname === "/api/clear" && req.method === "POST") {
    try {
      const raw = await readBody(req);
      const body = raw ? JSON.parse(raw) : {};
      const current = readState();
      if (body.which === "in") {
        sendJson(res, 200, writeState({ in: "", out: current.out }));
        return;
      }
      if (body.which === "out") {
        sendJson(res, 200, writeState({ in: current.in, out: "" }));
        return;
      }
      sendJson(res, 200, writeState({ in: "", out: "" }));
    } catch {
      sendJson(res, 400, { error: "Invalid JSON" });
    }
    return;
  }

  let filePath = path.join(PUBLIC_DIR, pathname === "/" ? "index.html" : pathname.slice(1));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(PUBLIC_DIR, "index.html");
  }

  const ext = path.extname(filePath);
  const types = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
  };

  res.writeHead(200, { "Content-Type": types[ext] ?? "text/plain" });
  res.end(fs.readFileSync(filePath));
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("  Paste Board Bridge — running");
  console.log(`  On this PC:     http://127.0.0.1:${PORT}`);
  console.log(`  On phone:       http://<TAILSCALE-PC-IP>:${PORT}`);
  console.log("  (Install Tailscale on phone + PC, use PC's 100.x.x.x IP)");
  console.log("");
});
