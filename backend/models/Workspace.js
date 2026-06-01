const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema(
  {
    workspaceName: {
      type: String,
      required: [true, "Workspace name is required"],
      trim: true,
      maxlength: 100
    },
    type: {
      type: String,
      enum: ["desk", "meeting-room", "private-office", "lab", "other"],
      default: "desk"
    },
    status: {
      type: String,
      enum: ["available", "occupied", "maintenance"],
      default: "available"
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workspace", workspaceSchema);
