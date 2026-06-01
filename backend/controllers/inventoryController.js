const Inventory = require("../models/Inventory");
const ActivityLog = require("../models/ActivityLog");
const { requireFields } = require("../utils/validators");

const getInventory = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const search = req.query.search || "";
    const status = req.query.status || "";

    const query = {};
    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ];
    }
    if (status) query.status = status;

    const [items, total] = await Promise.all([
      Inventory.find(query)
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Inventory.countDocuments(query)
    ]);

    res.json({ items, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    next(error);
  }
};

const createInventory = async (req, res, next) => {
  try {
    requireFields(req.body, ["itemName", "category"]);
    const quantity = Number(req.body.quantity);
    if (Number.isNaN(quantity) || quantity < 0) {
      res.status(400);
      throw new Error("Quantity must be a valid number");
    }

    const item = await Inventory.create({
      itemName: req.body.itemName,
      category: req.body.category,
      quantity,
      status: req.body.status || "available",
      assignedTo: req.body.assignedTo || null
    });

    await ActivityLog.create({
      user: req.user._id,
      action: "Inventory item added",
      detail: item.itemName
    });

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

const updateInventory = async (req, res, next) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error("Inventory item not found");
    }

    ["itemName", "category", "status", "assignedTo"].forEach((field) => {
      if (req.body[field] !== undefined) item[field] = req.body[field] || null;
    });
    if (req.body.quantity !== undefined) {
      const quantity = Number(req.body.quantity);
      if (Number.isNaN(quantity) || quantity < 0) {
        res.status(400);
        throw new Error("Quantity must be a valid number");
      }
      item.quantity = quantity;
    }

    await item.save();
    await ActivityLog.create({
      user: req.user._id,
      action: "Inventory item updated",
      detail: item.itemName
    });

    res.json(item);
  } catch (error) {
    next(error);
  }
};

const deleteInventory = async (req, res, next) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error("Inventory item not found");
    }

    await item.deleteOne();
    await ActivityLog.create({
      user: req.user._id,
      action: "Inventory item deleted",
      detail: item.itemName
    });

    res.json({ message: "Inventory item deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getInventory, createInventory, updateInventory, deleteInventory };
