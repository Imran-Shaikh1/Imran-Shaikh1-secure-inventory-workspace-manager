const express = require("express");
const {
  getWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace
} = require("../controllers/workspaceController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getWorkspaces);
router.post("/", protect, authorize("admin"), createWorkspace);
router.put("/:id", protect, authorize("admin"), updateWorkspace);
router.delete("/:id", protect, authorize("admin"), deleteWorkspace);

module.exports = router;
