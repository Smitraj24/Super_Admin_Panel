import Leave from "../models/Leave.js";
import User from "../models/User.models.js";

export const applyLeave = async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, reason } = req.body;

    if (!leaveType || !fromDate || !toDate || !reason) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const leave = await Leave.create({
      leaveType,
      fromDate,
      toDate,
      reason,
      user: req.user._id,
      department: req.user.department?._id,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Leave applied successfully",
      data: leave,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllLeaves = async (req, res) => {
  try {
    const isHRAdmin =
      req.user.role.name === "ADMIN" && req.user.department?.name === "HR";

    if (!isHRAdmin) {
      return res.status(403).json({
        message: "Only HR Admin can view all leaves",
      });
    }

    const leaves = await Leave.find({})
      .populate("user", "name email")
      .populate("department", "name");

    res.json({
      success: true,
      data: leaves,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching leaves" });
  }
};

export const getUserLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user._id })
      .populate("user", "name email")
      .populate("department", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: leaves,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user leaves" });
  }
};

export const updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    const isHRAdmin =
      req.user.role.name === "ADMIN" && req.user.department?.name === "HR";

    if (!isHRAdmin) {
      return res.status(403).json({
        message: "Only HR Admin can approve/reject",
      });
    }

    leave.status = status;
    await leave.save();

    res.json({
      success: true,
      data: leave,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
