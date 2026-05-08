const InventoryItem = require("../models/InventoryItem");
const StockMovement = require("../models/StockMovement");
const {
  inventoryPopulate,
} = require("../services/inventoryService");
const {
  buildProcurementSuggestion,
  predictLowStock,
} = require("../services/analyticsService");

async function getInsights(req, res) {
  const items = await InventoryItem.find().populate(inventoryPopulate);

  const insights = await Promise.all(
    items.map(async (item) => {
      const movements = await StockMovement.find({ item: item._id })
        .sort({ createdAt: -1 })
        .limit(60);
      const forecast = predictLowStock(item, movements);
      const suggestion = buildProcurementSuggestion(item, movements);
      return {
        itemId: item._id,
        inventoryNumber: item.inventoryNumber,
        itemName: item.name,
        branchName: item.branch?.name || "",
        usagePerDay: forecast.usagePerDay,
        daysUntilMinimum: forecast.daysUntilMinimum,
        risk: forecast.risk,
        recommendation: suggestion.reason,
        recommendedQuantity: suggestion.recommendedQuantity,
        shouldReorder: suggestion.shouldReorder,
        confidence: suggestion.confidence,
      };
    })
  );

  res.json({
    insights,
    lowStockPredictions: insights.filter((entry) =>
      ["critical", "high", "medium"].includes(entry.risk)
    ),
    reorderPlan: insights.filter((entry) => entry.shouldReorder),
  });
}

module.exports = {
  getInsights,
};
