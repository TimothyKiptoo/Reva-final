const defaults = require("../config/defaults");
const Branch = require("../models/Branch");
const Category = require("../models/Category");
const Department = require("../models/Department");
const InventoryItem = require("../models/InventoryItem");
const Supplier = require("../models/Supplier");
const User = require("../models/User");
const { hashPassword } = require("../utils/passwords");
const { slugPart } = require("../utils/inventoryNumber");

async function refreshLegacyBranding() {
  const companySlug = slugPart(defaults.companyName);
  const items = await InventoryItem.find({
    $or: [{ companyName: "TEAMCO" }, { inventoryNumber: /^TEAMCO-/ }],
  });

  for (const item of items) {
    item.companyName = defaults.companyName;
    if (item.inventoryNumber.startsWith("TEAMCO-")) {
      item.inventoryNumber = item.inventoryNumber.replace(
        /^TEAMCO-/,
        `${companySlug}-`
      );
    }
    await item.save();
  }

  const legacyAdmin = await User.findOne({ email: "admin@teamco.local" });
  if (legacyAdmin && legacyAdmin.email !== defaults.defaultAdminEmail) {
    legacyAdmin.email = defaults.defaultAdminEmail;
    await legacyAdmin.save();
  }
}

async function seedInitialData() {
  let headquarters = await Branch.findOne({ code: "HQ" });
  if (!headquarters) {
    headquarters = await Branch.create({
      name: "REVA Engineering Services Headquarters",
      code: "HQ",
      location: "Nairobi",
      contactEmail: defaults.headquartersEmail,
      isMain: true,
    });
  } else {
    headquarters.name = "REVA Engineering Services Headquarters";
    headquarters.contactEmail = defaults.headquartersEmail;
    await headquarters.save();
  }

  let warehouse = await Branch.findOne({ code: "WH1" });
  if (!warehouse) {
    warehouse = await Branch.create({
      name: "REVA Main Warehouse",
      code: "WH1",
      location: "Mombasa",
      contactEmail: defaults.warehouseEmail,
    });
  } else {
    warehouse.name = "REVA Main Warehouse";
    warehouse.contactEmail = defaults.warehouseEmail;
    await warehouse.save();
  }

  let opsDepartment = await Department.findOne({
    code: "OPS",
    branch: headquarters._id,
  });
  if (!opsDepartment) {
    opsDepartment = await Department.create({
      name: "Operations",
      code: "OPS",
      branch: headquarters._id,
      description: "Core stock and fulfillment operations",
    });
  }

  let itDepartment = await Department.findOne({
    code: "IT",
    branch: headquarters._id,
  });
  if (!itDepartment) {
    itDepartment = await Department.create({
      name: "Information Technology",
      code: "IT",
      branch: headquarters._id,
    });
  }

  let category = await Category.findOne({ code: "EQUIP" });
  if (!category) {
    category = await Category.create({
      name: "Equipment",
      code: "EQUIP",
      description: "Operational equipment and smart devices",
      subcategories: [
        { name: "Barcode Scanners", code: "BARSCAN" },
        { name: "RFID Readers", code: "RFID" },
        { name: "Laptops", code: "LAPTOP" },
      ],
    });
  }

  let supplier = await Supplier.findOne({ name: "Nova Supply Chain" });
  if (!supplier) {
    supplier = await Supplier.create({
      name: "Nova Supply Chain",
      contactPerson: "Grace Mwangi",
      email: "procurement@novasupply.local",
      phone: "+254700000000",
      leadTimeDays: 5,
      reliabilityScore: 92,
      preferredCategoryCodes: ["EQUIP"],
    });
  }

  const existingAdmin = await User.findOne({ email: defaults.defaultAdminEmail });
  if (!existingAdmin) {
    const password = hashPassword(defaults.defaultAdminPassword);
    await User.create({
      name: "System Administrator",
      email: defaults.defaultAdminEmail,
      passwordHash: password.hash,
      passwordSalt: password.salt,
      role: "administrator",
      branch: headquarters._id,
      department: opsDepartment._id,
      phone: "+254711111111",
      darkMode: true,
    });
  }

  const sampleCount = await InventoryItem.countDocuments();
  if (!sampleCount) {
    await InventoryItem.create([
      {
        companyName: defaults.companyName,
        branch: headquarters._id,
        department: opsDepartment._id,
        category: category._id,
        subcategory: { name: "Barcode Scanners", code: "BARSCAN" },
        supplier: supplier._id,
        name: "OrbitScan Pro X2",
        description: "AI-ready 2D barcode scanner for warehouse counters",
        unit: "pcs",
        sku: "OSC-X2",
        inventoryNumber:
          "REVA-ENGINEERING-SERVICES-OPERATIONS-EQUIPMENT-BARCODE-SCANNERS-0001",
        barcode: "8900001001001",
        rfidTag: "RFID-OSC-X2-01",
        quantityOnHand: 18,
        minimumLevel: 4,
        reorderLevel: 8,
        reorderQuantity: 20,
        unitCost: 120,
        sellingPrice: 180,
        status: "active",
      },
      {
        companyName: defaults.companyName,
        branch: warehouse._id,
        department: itDepartment._id,
        category: category._id,
        subcategory: { name: "RFID Readers", code: "RFID" },
        supplier: supplier._id,
        name: "PulseRF Reader 5",
        description: "Branch-ready RFID receiver for rapid stock counts",
        unit: "pcs",
        sku: "PRF-5",
        inventoryNumber:
          "REVA-ENGINEERING-SERVICES-INFORMATION-TECHNOLOGY-EQUIPMENT-RFID-READERS-0001",
        barcode: "8900001001002",
        rfidTag: "RFID-PRF-5-01",
        quantityOnHand: 6,
        minimumLevel: 3,
        reorderLevel: 5,
        reorderQuantity: 12,
        unitCost: 340,
        sellingPrice: 420,
        status: "active",
      },
    ]);
  }

  await refreshLegacyBranding();

  return {
    defaultAdminEmail: defaults.defaultAdminEmail,
    defaultAdminPassword: defaults.defaultAdminPassword,
  };
}

module.exports = {
  seedInitialData,
};
