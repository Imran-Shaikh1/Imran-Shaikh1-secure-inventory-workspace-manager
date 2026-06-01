const express = require("express");
const {
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory
} = require("../controllers/inventoryController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getInventory);
router.post("/", protect, authorize("admin"), createInventory);
router.put("/:id", protect, authorize("admin"), updateInventory);
router.delete("/:id", protect, authorize("admin"), deleteInventory);

module.exports = router;
