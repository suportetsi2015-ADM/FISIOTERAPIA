// server.ts
import express from "express";
import path2 from "path";
import fs2 from "fs";
import { fileURLToPath } from "url";

// src/server/appointmentsApi.ts
import fs from "fs";
import path from "path";
var DATA_DIR = path.resolve(process.cwd(), "data");
var APPOINTMENTS_FILE = path.resolve(DATA_DIR, "appointments.json");
var SCHEDULE_CONFIG_FILE = path.resolve(DATA_DIR, "schedule_config.json");
var LATEST_ALERT_FILE = path.resolve(DATA_DIR, "latest_alert.json");
var INITIAL_SEED_APPOINTMENTS = [
  {
    id: "APT-1001",
    patientName: "Camila Vasconcelos",
    patientPhone: "(92) 99123-4567",
    patientEmail: "camila.vasconcelos@gmail.com",
    date: "2026-09-22",
    timeSlot: "08:00",
    service: "Avalia\xE7\xE3o Fisioterap\xEAutica & Pilates",
    notes: "Dores lombares cr\xF4nicas por trabalho em escrit\xF3rio na Cidade Nova.",
    status: "confirmado",
    createdAt: "2026-09-18T14:30:00.000Z"
  },
  {
    id: "APT-1002",
    patientName: "Juliana Barreto Mendes",
    patientPhone: "(92) 98455-8920",
    patientEmail: "juliana.mendes@hotmail.com",
    date: "2026-09-22",
    timeSlot: "09:00",
    service: "Pilates Personalizado",
    notes: "Fortalecimento postural e al\xEDvio de tens\xF5es nos ombros.",
    status: "confirmado",
    createdAt: "2026-09-19T09:15:00.000Z"
  },
  {
    id: "APT-1003",
    patientName: "Larissa Albuquerque",
    patientPhone: "(92) 98112-3344",
    date: "2026-09-23",
    timeSlot: "15:00",
    service: "Reabilita\xE7\xE3o do Movimento & Coluna",
    notes: "H\xE9rnia de disco L4-L5, indica\xE7\xE3o m\xE9dica para estabiliza\xE7\xE3o.",
    status: "confirmado",
    createdAt: "2026-09-19T10:45:00.000Z"
  },
  {
    id: "APT-1004",
    patientName: "Beatriz Fontes Nogueira",
    patientPhone: "(92) 99341-7788",
    patientEmail: "beatriz.fontes@yahoo.com.br",
    date: "2026-09-23",
    timeSlot: "17:00",
    service: "Pilates para Terceira Idade / Envelhecimento Ativo",
    notes: "Melhora de equil\xEDbrio e mobilidade geral.",
    status: "confirmado",
    createdAt: "2026-09-19T11:00:00.000Z"
  }
];
var sseClients = /* @__PURE__ */ new Set();
function broadcastSSE(data) {
  const payload = `data: ${JSON.stringify(data)}

`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (_) {
      sseClients.delete(client);
    }
  }
}
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}
function loadAppointmentsFromDisk() {
  ensureDataDir();
  try {
    if (fs.existsSync(APPOINTMENTS_FILE)) {
      const raw = fs.readFileSync(APPOINTMENTS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("[Server] Erro ao ler appointments.json:", e);
  }
  saveAppointmentsToDisk(INITIAL_SEED_APPOINTMENTS);
  return INITIAL_SEED_APPOINTMENTS;
}
function saveAppointmentsToDisk(apts) {
  ensureDataDir();
  try {
    fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(apts, null, 2), "utf-8");
  } catch (e) {
    console.error("[Server] Erro ao salvar appointments.json:", e);
  }
}
function loadLatestAlertFromDisk() {
  ensureDataDir();
  try {
    if (fs.existsSync(LATEST_ALERT_FILE)) {
      const raw = fs.readFileSync(LATEST_ALERT_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("[Server] Erro ao ler latest_alert.json:", e);
  }
  return { appointment: null, timestamp: 0, acknowledged: true };
}
function saveLatestAlertToDisk(alertState) {
  ensureDataDir();
  try {
    fs.writeFileSync(LATEST_ALERT_FILE, JSON.stringify(alertState, null, 2), "utf-8");
  } catch (e) {
    console.error("[Server] Erro ao salvar latest_alert.json:", e);
  }
}
function readRequestBody(req) {
  if (req.body && typeof req.body === "object") {
    return Promise.resolve(req.body);
  }
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const bodyStr = Buffer.concat(chunks).toString("utf-8");
        resolve(bodyStr ? JSON.parse(bodyStr) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", (err) => reject(err));
  });
}
function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.end(JSON.stringify(data));
}
async function handleAppointmentsApi(req, res) {
  const url = req.url || "";
  const method = req.method || "GET";
  if (method === "OPTIONS" && url.startsWith("/api/")) {
    sendJson(res, 204, {});
    return true;
  }
  if (url === "/api/health") {
    sendJson(res, 200, { status: "ok", time: Date.now() });
    return true;
  }
  if (url.startsWith("/api/appointments/stream")) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders?.();
    const appointments = loadAppointmentsFromDisk();
    const latestAlert = loadLatestAlertFromDisk();
    res.write(`data: ${JSON.stringify({
      type: "init",
      appointments,
      latestAlert: latestAlert.acknowledged ? null : latestAlert,
      serverTime: Date.now()
    })}

`);
    sseClients.add(res);
    req.on("close", () => {
      sseClients.delete(res);
    });
    return true;
  }
  if (url.startsWith("/api/appointments/poll")) {
    if (method !== "GET") {
      sendJson(res, 405, { error: "Method not allowed" });
      return true;
    }
    const appointments = loadAppointmentsFromDisk();
    const latestAlert = loadLatestAlertFromDisk();
    const pendingCount = appointments.filter((a) => a.status === "pendente").length;
    sendJson(res, 200, {
      appointments,
      latestAlert: latestAlert.acknowledged ? null : latestAlert,
      pendingCount,
      serverTime: Date.now()
    });
    return true;
  }
  if (url === "/api/appointments/ack-alert") {
    if (method !== "POST") {
      sendJson(res, 405, { error: "Method not allowed" });
      return true;
    }
    const currentAlert = loadLatestAlertFromDisk();
    currentAlert.acknowledged = true;
    saveLatestAlertToDisk(currentAlert);
    broadcastSSE({ type: "alert-acknowledged", alert: currentAlert });
    sendJson(res, 200, { success: true, message: "Alerta reconhecido com sucesso" });
    return true;
  }
  if (url === "/api/appointments" || url.startsWith("/api/appointments?")) {
    if (method === "GET") {
      const appointments = loadAppointmentsFromDisk();
      sendJson(res, 200, appointments);
      return true;
    }
    if (method === "POST") {
      try {
        const body = await readRequestBody(req);
        if (!body.patientName || !body.patientPhone) {
          sendJson(res, 400, { error: "Nome e telefone s\xE3o obrigat\xF3rios" });
          return true;
        }
        const appointments = loadAppointmentsFromDisk();
        const newApt = {
          id: `APT-${Math.floor(1e3 + Math.random() * 9e3)}`,
          patientName: String(body.patientName).trim(),
          patientPhone: String(body.patientPhone).trim(),
          patientEmail: body.patientEmail ? String(body.patientEmail).trim() : void 0,
          date: body.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
          timeSlot: body.timeSlot || "09:00",
          service: body.service || "Avalia\xE7\xE3o Fisioterap\xEAutica & Pilates",
          notes: body.notes ? String(body.notes).trim() : void 0,
          status: body.status || "pendente",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        const updated = [newApt, ...appointments];
        saveAppointmentsToDisk(updated);
        if (newApt.status === "pendente") {
          const alertState = {
            appointment: newApt,
            timestamp: Date.now(),
            acknowledged: false
          };
          saveLatestAlertToDisk(alertState);
          broadcastSSE({ type: "new-booking", appointment: newApt, alert: alertState });
        } else {
          broadcastSSE({ type: "appointments-updated", appointments: updated });
        }
        sendJson(res, 201, { success: true, appointment: newApt });
        return true;
      } catch (err) {
        sendJson(res, 500, { error: err.message || "Erro ao processar cadastro" });
        return true;
      }
    }
    if (method === "PUT") {
      const parsedUrl = new URL(url, "http://localhost");
      const id = parsedUrl.searchParams.get("id");
      if (!id) {
        sendJson(res, 400, { error: "ID do agendamento \xE9 obrigat\xF3rio" });
        return true;
      }
      const body = await readRequestBody(req);
      const appointments = loadAppointmentsFromDisk();
      let updatedApt = null;
      const nextList = appointments.map((a) => {
        if (a.id === id) {
          const merged = { ...a, ...body };
          updatedApt = merged;
          return merged;
        }
        return a;
      });
      if (!updatedApt) {
        sendJson(res, 404, { error: "Agendamento n\xE3o encontrado" });
        return true;
      }
      saveAppointmentsToDisk(nextList);
      const currentAlert = loadLatestAlertFromDisk();
      if (currentAlert.appointment?.id === id) {
        currentAlert.acknowledged = true;
        saveLatestAlertToDisk(currentAlert);
      }
      sendJson(res, 200, { success: true, appointment: updatedApt });
      return true;
    }
    if (method === "DELETE") {
      const parsedUrl = new URL(url, "http://localhost");
      const id = parsedUrl.searchParams.get("id");
      if (!id) {
        sendJson(res, 400, { error: "ID do agendamento \xE9 obrigat\xF3rio" });
        return true;
      }
      const appointments = loadAppointmentsFromDisk();
      const nextList = appointments.filter((a) => a.id !== id);
      saveAppointmentsToDisk(nextList);
      sendJson(res, 200, { success: true });
      return true;
    }
  }
  const idMatch = url.match(/^\/api\/appointments\/([A-Za-z0-9_-]+)/);
  if (idMatch) {
    const id = idMatch[1];
    if (method === "PUT") {
      const body = await readRequestBody(req);
      const appointments = loadAppointmentsFromDisk();
      let updatedApt = null;
      const nextList = appointments.map((a) => {
        if (a.id === id) {
          const merged = { ...a, ...body };
          updatedApt = merged;
          return merged;
        }
        return a;
      });
      if (!updatedApt) {
        sendJson(res, 404, { error: "Agendamento n\xE3o encontrado" });
        return true;
      }
      saveAppointmentsToDisk(nextList);
      const currentAlert = loadLatestAlertFromDisk();
      if (currentAlert.appointment?.id === id) {
        currentAlert.acknowledged = true;
        saveLatestAlertToDisk(currentAlert);
      }
      sendJson(res, 200, { success: true, appointment: updatedApt });
      return true;
    }
    if (method === "DELETE") {
      const appointments = loadAppointmentsFromDisk();
      const nextList = appointments.filter((a) => a.id !== id);
      saveAppointmentsToDisk(nextList);
      sendJson(res, 200, { success: true });
      return true;
    }
  }
  if (url === "/api/schedule-config" || url.startsWith("/api/schedule-config?")) {
    ensureDataDir();
    if (method === "GET") {
      if (fs.existsSync(SCHEDULE_CONFIG_FILE)) {
        try {
          const cfg = JSON.parse(fs.readFileSync(SCHEDULE_CONFIG_FILE, "utf-8"));
          sendJson(res, 200, cfg);
          return true;
        } catch (e) {
        }
      }
      sendJson(res, 200, null);
      return true;
    }
    if (method === "POST") {
      const body = await readRequestBody(req);
      fs.writeFileSync(SCHEDULE_CONFIG_FILE, JSON.stringify(body, null, 2), "utf-8");
      sendJson(res, 200, { success: true, config: body });
      return true;
    }
  }
  return false;
}

// server.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3e3;
  const isProd = process.env.NODE_ENV === "production";
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Cache-Control, Pragma");
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
    if (req.url.startsWith("/api") || req.url === "/" || req.url.endsWith(".html")) {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    }
    next();
  });
  const publicImagesDir = path2.resolve(__dirname, "public/images");
  app.use("/images", express.static(publicImagesDir, {
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    }
  }));
  app.post("/api/save-official-photo", (req, res) => {
    try {
      const { type, dataUrl } = req.body;
      if (!dataUrl) {
        res.status(400).json({ error: "Nenhum dado de imagem fornecido" });
        return;
      }
      const matches = dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (!matches) {
        res.status(400).json({ error: "Formato de imagem inv\xE1lido" });
        return;
      }
      const buffer = Buffer.from(matches[2], "base64");
      const filename = type === "logo" ? "logo.png" : type === "principal" || type === "studioHero" || type === "hero" ? "dra_leia_principal.jpg" : "dra_leia_sobre.jpg";
      const publicDir = path2.resolve(__dirname, "public/images");
      const assetsDir = path2.resolve(__dirname, "src/assets/images");
      const distImagesDir = path2.resolve(__dirname, "dist/images");
      fs2.mkdirSync(publicDir, { recursive: true });
      fs2.mkdirSync(assetsDir, { recursive: true });
      if (fs2.existsSync(path2.resolve(__dirname, "dist"))) {
        fs2.mkdirSync(distImagesDir, { recursive: true });
        fs2.writeFileSync(path2.resolve(distImagesDir, filename), buffer);
      }
      fs2.writeFileSync(path2.resolve(publicDir, filename), buffer);
      fs2.writeFileSync(path2.resolve(assetsDir, filename), buffer);
      res.json({
        success: true,
        url: `/images/${filename}?t=${Date.now()}`
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.use(async (req, res, next) => {
    if (req.url.startsWith("/api/appointments") || req.url.startsWith("/api/schedule-config") || req.url === "/api/health") {
      try {
        const handled = await handleAppointmentsApi(req, res);
        if (handled) return;
      } catch (err) {
        console.error("[API Server] Erro ao processar rota:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Erro interno ao processar agendamento" });
        }
        return;
      }
    }
    next();
  });
  const distDir = path2.resolve(__dirname, "dist");
  const hasDist = fs2.existsSync(distDir) && fs2.existsSync(path2.resolve(distDir, "index.html"));
  if (isProd || hasDist && process.env.VITE_DEV !== "true") {
    console.log("[Server] Modo Produ\xE7\xE3o: servindo arquivos est\xE1ticos de", distDir);
    app.use(
      express.static(distDir, {
        setHeaders: (res, filePath) => {
          if (filePath.endsWith(".html")) {
            res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");
          }
        }
      })
    );
    app.use((req, res, next) => {
      if (req.method !== "GET") return next();
      if (req.url.startsWith("/api")) return next();
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
      res.sendFile(path2.resolve(distDir, "index.html"));
    });
  } else {
    console.log("[Server] Modo Desenvolvimento: inicializando middlewares Vite...");
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true, host: "0.0.0.0", port: PORT },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Dra. L\xE9ia Mar Server] Servidor Full-Stack rodando na porta ${PORT} (0.0.0.0:${PORT})`);
    console.log(`[Dra. L\xE9ia Mar Server] Alertas em tempo real monitorando na rota /api/appointments/poll e /api/appointments/stream`);
  });
}
startServer().catch((err) => {
  console.error("[Dra. L\xE9ia Mar Server] Falha fatal ao iniciar servidor:", err);
  process.exit(1);
});
