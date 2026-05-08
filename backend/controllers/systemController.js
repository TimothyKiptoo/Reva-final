const defaults = require("../config/defaults");
const { getRealtimeCapabilities, registerSseClient } = require("../services/socketService");

function getCapabilities(req, res) {
  res.json({
    branding: {
      companyName: defaults.companyName,
      appName: defaults.appName,
    },
    access: {
      remoteLoginEnabled: true,
      publicBaseUrl: defaults.publicBaseUrl || null,
      host: defaults.host,
      allowedOrigins: defaults.allowedOrigins,
    },
    realtime: getRealtimeCapabilities(),
    features: {
      barcode: true,
      rfid: true,
      offlineMode: true,
      exports: ["excel", "pdf"],
      aiForecasting: true,
      socketIoRequested: getRealtimeCapabilities().socketIoAvailable,
    },
  });
}

function getHealth(req, res) {
  res.json({
    status: "ok",
    service: defaults.appName,
    companyName: defaults.companyName,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
}

function streamEvents(req, res) {
  registerSseClient(res);
}

module.exports = {
  getCapabilities,
  getHealth,
  streamEvents,
};
