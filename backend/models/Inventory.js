const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      maxlength: 100
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxlength: 60
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: 0,
      default: 0
    },
    status: {
      type: String,
      enum: ["available", "assigned", "maintenance", "retired"],
      default: "available"
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);
