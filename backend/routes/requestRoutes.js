const express = require("express");
const {
  getRequests,
  createRequest,
  updateRequestStatus
} = require("../controllers/requestController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getRequests);
router.post("/", protect, createRequest);
router.put("/:id/status", protect, authorize("admin"), updateRequestStatus);

module.exports = router;
