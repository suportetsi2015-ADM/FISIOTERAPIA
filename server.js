// server.ts
import express from "express";
import path3 from "path";
import fs3 from "fs";
import { fileURLToPath } from "url";

// src/server/appointmentsApi.ts
import fs from "fs";
import path from "path";

// src/utils/phoneFormatter.ts
function formatPhoneBR(phone) {
  if (!phone) return "";
  const str = String(phone).trim();
  const digits = str.replace(/\D/g, "");
  if (!digits) return str;
  let clean = digits;
  if (clean.startsWith("55") && (clean.length === 12 || clean.length === 13)) {
    clean = clean.slice(2);
  }
  if (clean.length === 11) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
  }
  if (clean.length === 10) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  }
  if (clean.length === 9) {
    return `(92) ${clean.slice(0, 5)}-${clean.slice(5)}`;
  }
  if (clean.length === 8) {
    return `(92) ${clean.slice(0, 4)}-${clean.slice(4)}`;
  }
  if (clean.length > 2 && clean.length <= 6) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
  }
  if (clean.length > 6 && clean.length < 11) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  }
  return str;
}

// src/server/appointmentsApi.ts
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
        return parsed.map((apt) => ({
          ...apt,
          patientPhone: formatPhoneBR(apt.patientPhone)
        }));
      }
    }
  } catch (e) {
    console.error("[Server] Erro ao ler appointments.json:", e);
  }
  const formattedSeeds = INITIAL_SEED_APPOINTMENTS.map((apt) => ({
    ...apt,
    patientPhone: formatPhoneBR(apt.patientPhone)
  }));
  saveAppointmentsToDisk(formattedSeeds);
  return formattedSeeds;
}
function saveAppointmentsToDisk(apts) {
  ensureDataDir();
  try {
    const formatted = apts.map((apt) => ({
      ...apt,
      patientPhone: formatPhoneBR(apt.patientPhone)
    }));
    fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(formatted, null, 2), "utf-8");
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
        const idToUse = body.id && typeof body.id === "string" && body.id.trim() ? body.id.trim() : `APT-${Math.floor(1e3 + Math.random() * 9e3)}`;
        const existingIdx = appointments.findIndex((a) => a.id === idToUse);
        const newApt = {
          id: idToUse,
          patientName: String(body.patientName).trim(),
          patientPhone: formatPhoneBR(String(body.patientPhone).trim()),
          patientEmail: body.patientEmail ? String(body.patientEmail).trim() : void 0,
          date: body.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
          timeSlot: body.timeSlot || "09:00",
          service: body.service || "Avalia\xE7\xE3o Fisioterap\xEAutica & Pilates",
          notes: body.notes ? String(body.notes).trim() : void 0,
          status: body.status || "pendente",
          createdAt: body.createdAt || (/* @__PURE__ */ new Date()).toISOString()
        };
        let updated;
        if (existingIdx >= 0) {
          updated = [...appointments];
          updated[existingIdx] = newApt;
        } else {
          updated = [newApt, ...appointments];
        }
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
          const merged = {
            ...a,
            ...body,
            ...body.patientPhone ? { patientPhone: formatPhoneBR(body.patientPhone) } : {}
          };
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

// src/server/adminSyncApi.ts
import fs2 from "fs";
import path2 from "path";
var DATA_DIR2 = path2.resolve(process.cwd(), "data");
function ensureDataDir2() {
  if (!fs2.existsSync(DATA_DIR2)) {
    fs2.mkdirSync(DATA_DIR2, { recursive: true });
  }
}
function getFilePath(entity) {
  ensureDataDir2();
  return path2.resolve(DATA_DIR2, `${entity}.json`);
}
function readEntity(entity) {
  try {
    const file = getFilePath(entity);
    if (fs2.existsSync(file)) {
      const content = fs2.readFileSync(file, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`[AdminSync] Erro ao ler ${entity}:`, err);
  }
  return null;
}
function writeEntity(entity, data) {
  try {
    const file = getFilePath(entity);
    fs2.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
    broadcastSSE({
      type: "admin-config-updated",
      entity,
      data,
      timestamp: Date.now()
    });
    return true;
  } catch (err) {
    console.error(`[AdminSync] Erro ao gravar ${entity}:`, err);
    return false;
  }
}
function readRequestBody2(req) {
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
function sendJson2(res, statusCode, data) {
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
async function handleAdminSyncApi(req, res) {
  const url = req.url || "";
  const method = req.method || "GET";
  const routeEntityMap = {
    "/api/clinic-data": "clinic_data",
    "/api/schedule-config": "schedule_config",
    "/api/pilates-data": "pilates_data",
    "/api/clinical-patients": "clinical_patients",
    "/api/payroll-adjustments": "payroll_adjustments",
    "/api/faq-data": "faq_data",
    "/api/header-data": "header_data",
    "/api/footer-data": "footer_data",
    "/api/studio-data": "studio_data",
    "/api/auth-passwords": "auth_passwords",
    "/api/theme-data": "theme_data",
    "/api/security-alerts": "security_alerts"
  };
  for (const [routePrefix, entityName] of Object.entries(routeEntityMap)) {
    if (url === routePrefix || url.startsWith(`${routePrefix}?`)) {
      if (method === "GET") {
        const data = readEntity(entityName);
        sendJson2(res, 200, { success: true, data });
        return true;
      }
      if (method === "POST" || method === "PUT") {
        const body = await readRequestBody2(req);
        const payloadToSave = body.data !== void 0 ? body.data : body;
        const ok = writeEntity(entityName, payloadToSave);
        sendJson2(res, ok ? 200 : 500, { success: ok, data: payloadToSave });
        return true;
      }
      if (method === "DELETE") {
        const file = getFilePath(entityName);
        if (fs2.existsSync(file)) {
          fs2.unlinkSync(file);
        }
        broadcastSSE({
          type: "admin-config-updated",
          entity: entityName,
          data: null,
          timestamp: Date.now()
        });
        sendJson2(res, 200, { success: true, data: null });
        return true;
      }
    }
  }
  return false;
}

// server.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path3.dirname(__filename);
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
  const publicImagesDir = path3.resolve(__dirname, "public/images");
  app.use("/images", express.static(publicImagesDir, {
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    }
  }));
  const PHOTOS_CONFIG_PATH = path3.resolve(__dirname, "data/official_photos.json");
  function getOfficialPhotosConfig() {
    try {
      if (fs3.existsSync(PHOTOS_CONFIG_PATH)) {
        return JSON.parse(fs3.readFileSync(PHOTOS_CONFIG_PATH, "utf-8"));
      }
    } catch (_) {
    }
    return {
      studioHero: "/images/dra_leia_principal.jpg",
      portrait: "/images/dra_leia_sobre.jpg",
      customLogo: "/images/logo_transparente.png",
      heroUpdatedAt: Date.now(),
      portraitUpdatedAt: Date.now(),
      logoUpdatedAt: Date.now()
    };
  }
  function saveOfficialPhotosConfig(config) {
    try {
      const dataDir = path3.resolve(__dirname, "data");
      if (!fs3.existsSync(dataDir)) fs3.mkdirSync(dataDir, { recursive: true });
      fs3.writeFileSync(PHOTOS_CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
    } catch (e) {
      console.error("[OfficialPhotos] Erro ao gravar config:", e);
    }
  }
  app.get("/api/official-photos", (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    const config = getOfficialPhotosConfig();
    res.json({
      success: true,
      data: config
    });
  });
  app.post("/api/save-official-photo", (req, res) => {
    try {
      const { type, dataUrl } = req.body;
      if (!dataUrl || typeof dataUrl !== "string") {
        res.status(400).json({ error: "Nenhum dado ou URL de imagem fornecido" });
        return;
      }
      const config = getOfficialPhotosConfig();
      let photoUrl = "";
      const now = Date.now();
      if (dataUrl.startsWith("data:")) {
        const base64Index = dataUrl.indexOf(";base64,");
        if (base64Index === -1) {
          res.status(400).json({ error: "Formato Base64 inv\xE1lido (marcador ;base64, n\xE3o encontrado)" });
          return;
        }
        const rawBase64 = dataUrl.slice(base64Index + 8).trim();
        const buffer = Buffer.from(rawBase64, "base64");
        const baseName = type === "logo" || type === "customLogo" ? "logo_oficial" : type === "principal" || type === "studioHero" || type === "hero" ? "dra_leia_principal" : "dra_leia_sobre";
        const ext = type === "logo" || type === "customLogo" ? ".png" : ".jpg";
        const filename = `${baseName}${ext}`;
        const uniqueFilename = `${baseName}_${now}${ext}`;
        const publicDir = path3.resolve(__dirname, "public/images");
        const assetsDir = path3.resolve(__dirname, "src/assets/images");
        const distImagesDir = path3.resolve(__dirname, "dist/images");
        fs3.mkdirSync(publicDir, { recursive: true });
        fs3.mkdirSync(assetsDir, { recursive: true });
        if (fs3.existsSync(path3.resolve(__dirname, "dist"))) {
          fs3.mkdirSync(distImagesDir, { recursive: true });
          fs3.writeFileSync(path3.resolve(distImagesDir, filename), buffer);
          fs3.writeFileSync(path3.resolve(distImagesDir, uniqueFilename), buffer);
        }
        fs3.writeFileSync(path3.resolve(publicDir, filename), buffer);
        fs3.writeFileSync(path3.resolve(publicDir, uniqueFilename), buffer);
        fs3.writeFileSync(path3.resolve(assetsDir, filename), buffer);
        if (baseName === "logo_oficial") {
          fs3.writeFileSync(path3.resolve(publicDir, "logo.png"), buffer);
        }
        photoUrl = `/images/${uniqueFilename}`;
      } else {
        photoUrl = dataUrl.trim();
      }
      if (type === "studioHero" || type === "hero" || type === "principal") {
        config.studioHero = photoUrl;
        config.heroUpdatedAt = now;
      } else if (type === "portrait" || type === "sobre") {
        config.portrait = photoUrl;
        config.portraitUpdatedAt = now;
      } else if (type === "logo" || type === "customLogo") {
        config.customLogo = photoUrl;
        config.logoUpdatedAt = now;
      }
      saveOfficialPhotosConfig(config);
      broadcastSSE({
        type: "admin-config-updated",
        entity: "official_photos",
        data: { type, url: photoUrl, photos: config },
        timestamp: now
      });
      broadcastSSE({
        type: "admin-config-updated",
        entity: "official_photo",
        data: { type, url: photoUrl, photos: config },
        timestamp: now
      });
      res.json({
        success: true,
        url: photoUrl,
        photos: config
      });
    } catch (err) {
      console.error("[OfficialPhotos] Erro no upload:", err);
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/reset-official-photo", (req, res) => {
    try {
      const { type } = req.body || {};
      const config = getOfficialPhotosConfig();
      const now = Date.now();
      if (!type || type === "studioHero" || type === "hero" || type === "principal") {
        config.studioHero = `/images/dra_leia_principal.jpg?t=${now}`;
        config.heroUpdatedAt = now;
      }
      if (!type || type === "portrait" || type === "sobre") {
        config.portrait = `/images/dra_leia_sobre.jpg?t=${now}`;
        config.portraitUpdatedAt = now;
      }
      if (!type || type === "logo" || type === "customLogo") {
        config.customLogo = `/images/logo_transparente.png?t=${now}`;
        config.logoUpdatedAt = now;
      }
      saveOfficialPhotosConfig(config);
      broadcastSSE({
        type: "admin-config-updated",
        entity: "official_photos",
        data: { type: type || "all", photos: config },
        timestamp: now
      });
      broadcastSSE({
        type: "admin-config-updated",
        entity: "official_photo",
        data: { type: type || "all", photos: config },
        timestamp: now
      });
      res.json({ success: true, photos: config });
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
        console.error("[API Server] Erro ao processar rota de agendamentos:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Erro interno ao processar agendamento" });
        }
        return;
      }
    }
    if (req.url.startsWith("/api/clinic-data") || req.url.startsWith("/api/schedule-config") || req.url.startsWith("/api/pilates-data") || req.url.startsWith("/api/clinical-patients") || req.url.startsWith("/api/payroll-adjustments") || req.url.startsWith("/api/faq-data") || req.url.startsWith("/api/header-data") || req.url.startsWith("/api/footer-data") || req.url.startsWith("/api/studio-data") || req.url.startsWith("/api/auth-passwords") || req.url.startsWith("/api/theme-data") || req.url.startsWith("/api/security-alerts")) {
      try {
        const handledAdmin = await handleAdminSyncApi(req, res);
        if (handledAdmin) return;
      } catch (err) {
        console.error("[API Server] Erro ao processar sincroniza\xE7\xE3o de administrador:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Erro interno ao sincronizar configura\xE7\xF5es" });
        }
        return;
      }
    }
    next();
  });
  app.get(["/admin", "/admin/"], (req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    if (isProd || hasDist && process.env.VITE_DEV !== "true") {
      const adminFile = path3.resolve(distDir, "admin.html");
      if (fs3.existsSync(adminFile)) {
        res.sendFile(adminFile);
        return;
      }
    } else {
      req.url = "/admin.html";
    }
    next();
  });
  const distDir = path3.resolve(__dirname, "dist");
  const hasDist = fs3.existsSync(distDir) && fs3.existsSync(path3.resolve(distDir, "index.html"));
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
      res.sendFile(path3.resolve(distDir, "index.html"));
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
