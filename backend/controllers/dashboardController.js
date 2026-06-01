const Inventory = require("../models/Inventory");
const Workspace = require("../models/Workspace");
const BookingRequest = require("../models/Request");
const ActivityLog = require("../models/ActivityLog");

const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalInventoryCount,
      availableItems,
      assignedItems,
      totalWorkspaces,
      occupiedWorkspaces,
      pendingBookingRequests,
      recentActivity
    ] = await Promise.all([
      Inventory.countDocuments(),
      Inventory.countDocuments({ status: "available" }),
      Inventory.countDocuments({ status: "assigned" }),
      Workspace.countDocuments(),
      Workspace.countDocuments({ status: "occupied" }),
      BookingRequest.countDocuments({ status: "pending" }),
      ActivityLog.find().populate("user", "name role").sort({ createdAt: -1 }).limit(8)
    ]);

    res.json({
      totalInventoryCount,
      availableItems,
      assignedItems,
      totalWorkspaces,
      occupiedWorkspaces,
      pendingBookingRequests,
      recentActivity
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
