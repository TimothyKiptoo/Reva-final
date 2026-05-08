const http = require("http");
const os = require("os");
const express = require("express");
const path = require("path");
const cors = require("cors");
const defaults = require("./config/defaults");
const { connectDatabase } = require("./config/database");
const { seedInitialData } = require("./services/bootstrapService");
const { initRealtime } = require("./services/socketService");

const app = express();
const server = http.createServer(app);

function isOriginAllowed(origin) {
  if (!origin) {
    return true;
  }

  return (
    defaults.allowedOrigins.includes("*") ||
    defaults.allowedOrigins.includes(origin)
  );
}

function resolveAccessUrls() {
  const urls = new Set();
  urls.add(defaults.publicBaseUrl || `http://localhost:${defaults.port}`);

  Object.values(os.networkInterfaces())
    .flat()
    .filter((entry) => entry && entry.family === "IPv4" && !entry.internal)
    .forEach((entry) => {
      urls.add(`http://${entry.address}:${defaults.port}`);
    });

  return Array.from(urls);
}

app.set("trust proxy", 1);
app.use(
  cors({
    origin(origin, callback) {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS policy."));
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/barcodes", express.static(defaults.barcodeDir));
app.use(express.static(defaults.frontendDir));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/meta", require("./routes/metaRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));
app.use("/api/purchase-orders", require("./routes/purchaseOrderRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/activity", require("./routes/activityRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/system", require("./routes/systemRoutes"));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }
  return res.sendFile(path.join(defaults.frontendDir, "index.html"));
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  if (statusCode >= 500) {
    console.error(error);
  } else {
    console.warn(error.message);
  }
  res.status(statusCode).json({
    error: error.message || "Unexpected server error.",
  });
});

async function start() {
  await connectDatabase();
  const seed = await seedInitialData();
  initRealtime(server);

  server.listen(defaults.port, defaults.host, () => {
    console.log(
      `Server running on ${defaults.publicBaseUrl || `http://localhost:${defaults.port}`}`
    );
    console.log(
      `Default admin login: ${seed.defaultAdminEmail} / ${seed.defaultAdminPassword}`
    );
    console.log("Multi-location login URLs:");
    resolveAccessUrls().forEach((url) => {
      console.log(`- ${url}`);
    });
  });
}

start().catch((error) => {
  console.error("Failed to start enterprise inventory system:", error);
  process.exit(1);
});
