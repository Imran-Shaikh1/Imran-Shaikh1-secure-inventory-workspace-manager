const Workspace = require("../models/Workspace");
const ActivityLog = require("../models/ActivityLog");
const { requireFields } = require("../utils/validators");

const getWorkspaces = async (req, res, next) => {
  try {
    const search = req.query.search || "";
    const status = req.query.status || "";
    const query = {};

    if (search) {
      query.$or = [
        { workspaceName: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } }
      ];
    }
    if (status) query.status = status;

    const workspaces = await Workspace.find(query)
      .populate("bookedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(workspaces);
  } catch (error) {
    next(error);
  }
};

const createWorkspace = async (req, res, next) => {
  try {
    requireFields(req.body, ["workspaceName"]);
    const workspace = await Workspace.create({
      workspaceName: req.body.workspaceName,
      type: req.body.type || "desk",
      status: req.body.status || "available",
      bookedBy: req.body.bookedBy || null
    });

    await ActivityLog.create({
      user: req.user._id,
      action: "Workspace added",
      detail: workspace.workspaceName
    });

    res.status(201).json(workspace);
  } catch (error) {
    next(error);
  }
};

const updateWorkspace = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      res.status(404);
      throw new Error("Workspace not found");
    }

    ["workspaceName", "type", "status", "bookedBy"].forEach((field) => {
      if (req.body[field] !== undefined) workspace[field] = req.body[field] || null;
    });

    if (workspace.status === "available") workspace.bookedBy = null;

    await workspace.save();
    await ActivityLog.create({
      user: req.user._id,
      action: "Workspace updated",
      detail: workspace.workspaceName
    });

    res.json(workspace);
  } catch (error) {
    next(error);
  }
};

const deleteWorkspace = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      res.status(404);
      throw new Error("Workspace not found");
    }

    await workspace.deleteOne();
    await ActivityLog.create({
      user: req.user._id,
      action: "Workspace deleted",
      detail: workspace.workspaceName
    });

    res.json({ message: "Workspace deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWorkspaces, createWorkspace, updateWorkspace, deleteWorkspace };
