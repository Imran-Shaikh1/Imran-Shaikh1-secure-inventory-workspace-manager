const BookingRequest = require("../models/Request");
const Workspace = require("../models/Workspace");
const ActivityLog = require("../models/ActivityLog");

const getRequests = async (req, res, next) => {
  try {
    const query = req.user.role === "admin" ? {} : { userId: req.user._id };
    if (req.query.status) query.status = req.query.status;

    const requests = await BookingRequest.find(query)
      .populate("userId", "name email")
      .populate("workspaceId", "workspaceName type status")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    next(error);
  }
};

const createRequest = async (req, res, next) => {
  try {
    if (!req.body.workspaceId) {
      res.status(400);
      throw new Error("Workspace is required");
    }

    const workspace = await Workspace.findById(req.body.workspaceId);
    if (!workspace) {
      res.status(404);
      throw new Error("Workspace not found");
    }
    if (workspace.status !== "available") {
      res.status(400);
      throw new Error("Workspace is not available");
    }

    const existing = await BookingRequest.findOne({
      userId: req.user._id,
      workspaceId: workspace._id,
      status: "pending"
    });
    if (existing) {
      res.status(409);
      throw new Error("You already have a pending request for this workspace");
    }

    const request = await BookingRequest.create({
      userId: req.user._id,
      workspaceId: workspace._id
    });

    await ActivityLog.create({
      user: req.user._id,
      action: "Workspace request created",
      detail: workspace.workspaceName
    });

    const populated = await request.populate([
      { path: "userId", select: "name email" },
      { path: "workspaceId", select: "workspaceName type status" }
    ]);

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

const updateRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      res.status(400);
      throw new Error("Status must be approved or rejected");
    }

    const request = await BookingRequest.findById(req.params.id).populate("workspaceId");
    if (!request) {
      res.status(404);
      throw new Error("Request not found");
    }

    if (request.status !== "pending") {
      res.status(400);
      throw new Error("Only pending requests can be updated");
    }

    const workspace = request.workspaceId;
    request.status = status;

    if (status === "approved") {
      if (workspace.status !== "available") {
        res.status(400);
        throw new Error("Workspace is no longer available");
      }

      workspace.status = "occupied";
      workspace.bookedBy = request.userId;
      await workspace.save();

      await BookingRequest.updateMany(
        {
          _id: { $ne: request._id },
          workspaceId: workspace._id,
          status: "pending"
        },
        { status: "rejected" }
      );
    }

    await request.save();
    await ActivityLog.create({
      user: req.user._id,
      action: `Workspace request ${status}`,
      detail: workspace.workspaceName
    });

    const populated = await BookingRequest.findById(request._id)
      .populate("userId", "name email")
      .populate("workspaceId", "workspaceName type status");

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

module.exports = { getRequests, createRequest, updateRequestStatus };
