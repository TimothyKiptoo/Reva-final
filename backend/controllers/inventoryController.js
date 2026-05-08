const InventoryItem = require("../models/InventoryItem");
const PurchaseOrder = require("../models/PurchaseOrder");
const StockMovement = require("../models/StockMovement");
const Alert = require("../models/Alert");
const {
  buildBranchHealth,
  buildProcurementSuggestion,
  summarizeInventory,
} = require("../services/analyticsService");
const {
  inventoryPopulate,
  createInventoryItem,
  updateInventoryItem,
  applyStockMovement,
  syncOfflineOperations,
} = require("../services/inventoryService");
const { runAutoStockAgent } = require("../services/aiStockAgentService");
const {
  generateInventoryExcel,
  generateInventoryPdf,
} = require("../services/exportService");

async function listInventory(req, res) {
  const query = {};
  if (req.query.branch) {
    query.branch = req.query.branch;
  }
  if (req.query.status) {
    query.status = req.query.status;
  }
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { inventoryNumber: { $regex: req.query.search, $options: "i" } },
      { barcode: { $regex: req.query.search, $options: "i" } },
      { rfidTag: { $regex: req.query.search, $options: "i" } },
    ];
  }

  const items = await InventoryItem.find(query)
    .sort({ createdAt: -1 })
    .populate(inventoryPopulate);

  res.json({ items });
}

async function createItem(req, res) {
  const item = await createInventoryItem({
    payload: req.body,
    user: req.user,
  });
  res.status(201).json({ item });
}

async function updateItem(req, res) {
  const item = await updateInventoryItem({
    itemId: req.params.id,
    payload: req.body,
    user: req.user,
  });
  res.json({ item });
}

async function createMovement(req, res) {
  const result = await applyStockMovement({
    itemId: req.params.id,
    payload: req.body,
    user: req.user,
  });
  res.status(201).json(result);
}

async function getDashboard(req, res) {
  const [items, alerts, purchaseOrders, recentMovements] = await Promise.all([
    InventoryItem.find().populate(inventoryPopulate),
    Alert.find({ status: "open" }).sort({ createdAt: -1 }).limit(12).populate("branch item"),
    PurchaseOrder.find().sort({ createdAt: -1 }).limit(12).populate("branch supplier"),
    StockMovement.find()
      .sort({ createdAt: -1 })
      .limit(16)
      .populate("item", "name inventoryNumber")
      .populate("performedBy", "name role")
      .populate("branch", "name code"),
  ]);

  const suggestions = await Promise.all(
    items.map(async (item) => {
      const movements = await StockMovement.find({ item: item._id })
        .sort({ createdAt: -1 })
        .limit(40);
      const suggestion = buildProcurementSuggestion(item, movements);
      return {
        itemId: item._id,
        inventoryNumber: item.inventoryNumber,
        itemName: item.name,
        branchName: item.branch?.name || "",
        shouldReorder: suggestion.shouldReorder,
        urgency: suggestion.urgency,
        recommendedQuantity: suggestion.recommendedQuantity,
        confidence: suggestion.confidence,
        reason: suggestion.reason,
      };
    })
  );

  const fraudWatchlist = recentMovements
    .filter((movement) => movement.fraudScore >= 60)
    .map((movement) => ({
      id: movement._id,
      itemName: movement.item?.name || "Unknown Item",
      inventoryNumber: movement.item?.inventoryNumber || "",
      fraudScore: movement.fraudScore,
      type: movement.type,
      branch: movement.branch?.name || "",
      createdAt: movement.createdAt,
    }));

  res.json({
    summary: summarizeInventory(items, alerts, purchaseOrders),
    branchHealth: buildBranchHealth(items),
    suggestions: suggestions.filter((entry) => entry.shouldReorder),
    fraudWatchlist,
    alerts,
    recentMovements,
  });
}

async function exportInventory(req, res) {
  const items = await InventoryItem.find()
    .sort({ name: 1 })
    .populate(inventoryPopulate);
  const format = String(req.query.format || "excel").toLowerCase();

  if (format === "pdf") {
    const pdf = generateInventoryPdf(items);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="enterprise-inventory-report.pdf"'
    );
    return res.send(pdf);
  }

  const excel = generateInventoryExcel(items);
  res.setHeader("Content-Type", "application/vnd.ms-excel");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="enterprise-inventory-report.xls"'
  );
  return res.send(excel);
}

async function syncOffline(req, res) {
  const results = await syncOfflineOperations({
    clientId: req.body.clientId || "browser-client",
    operations: req.body.operations || [],
    user: req.user,
  });

  res.json({ results });
}

async function runAiAutoStock(req, res) {
  const result = await runAutoStockAgent({
    payload: req.body,
    user: req.user,
  });

  res.status(201).json(result);
}

module.exports = {
  listInventory,
  createItem,
  updateItem,
  createMovement,
  getDashboard,
  exportInventory,
  syncOffline,
  runAiAutoStock,
};
