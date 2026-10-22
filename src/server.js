/**
 * src/server.js
 * Production Web Server & API for Agentic Social & Client Finder.
 * Serves the responsive web frontend, secure RESTful APIs, and autonomous agent orchestration.
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const apiRoutes = require("./api/routes");

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

// Security & Header Middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("X-Powered-By", "Agentic Social Core Engine");
  next();
});

// Basic CORS & Parsers
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Lightweight Rate Limiter Middleware
const requestCounts = new Map();
app.use("/api/", (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || "local";
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 180; // 180 req/min per IP

  let record = requestCounts.get(ip);
  if (!record || now - record.startTime > windowMs) {
    record = { startTime: now, count: 1 };
  } else {
    record.count++;
  }
  requestCounts.set(ip, record);

  if (record.count > maxRequests) {
    return res.status(429).json({
      success: false,
      error: "Too many requests. Please wait a moment before trying again."
    });
  }
  next();
});

// Periodic cleanup of rate limiter map (unref'd to allow graceful event loop termination)
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of requestCounts.entries()) {
    if (now - record.startTime > 120000) {
      requestCounts.delete(ip);
    }
  }
}, 60000);
if (cleanupTimer.unref) cleanupTimer.unref();

// API Router
app.use("/api", apiRoutes);

// Static Web Frontend (Agentic Social & Client Finder)
const publicDir = path.resolve(__dirname, "../public");
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}

// Fallback to index.html for SPA client-side routes (Express 5 compatible wildcard handler)
app.use((req, res) => {
  const indexPath = path.resolve(publicDir, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({
      platform: "Agentic Social & Client Finder",
      status: "ONLINE",
      apiEndpoints: "/api/health",
      documentation: "See README.md"
    });
  }
});

// Global Error Handler (Sanitizes errors, hides internal traces)
app.use((err, req, res, next) => {
  console.error(`[Server Error] ${req.method} ${req.url}:`, err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error occurred."
  });
});

function startServer(port = PORT) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, HOST, () => {
      console.log(`\n==================================================`);
      console.log(`🚀 Agentic Social & Client Finder Active!`);
      console.log(`🌐 Local Web Portal: http://localhost:${port}`);
      console.log(`📡 API Base:        http://localhost:${port}/api/health`);
      console.log(`==================================================\n`);
      resolve(server);
    }).on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.warn(`Port ${port} is in use, trying ${Number(port) + 1}...`);
        resolve(startServer(Number(port) + 1));
      } else {
        reject(err);
      }
    });
  });
}

// Execute directly if run via `node src/server.js`
if (require.main === module) {
  startServer().catch(console.error);
}

module.exports = { app, startServer };
