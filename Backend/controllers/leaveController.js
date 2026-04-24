import Leave from "../models/Leave.js";
import User from "../models/User.models.js";

export const applyLeave = async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, reason, isHalfDay } = req.body;

    if (!leaveType || !fromDate || !toDate || !reason) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate half-day leave
    if (isHalfDay) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      
      // Half-day leave should be for the same day
      if (from.toDateString() !== to.toDateString()) {
        return res.status(400).json({ 
          message: "Half-day leave must be for a single day" 
        });
      }
    }

    // Calculate leave days
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to - from);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const leaveDays = isHalfDay ? 0.5 : diffDays;

    // Get user with leave balance
    const user = await User.findById(req.user._id);
    
    // Check if user has sufficient leave balance
    if (!user.leaveBalance || user.leaveBalance[leaveType] === undefined) {
      return res.status(400).json({ 
        message: `Invalid leave type: ${leaveType}` 
      });
    }

    if (user.leaveBalance[leaveType] < leaveDays) {
      return res.status(400).json({ 
        message: `Insufficient ${leaveType} balance. Available: ${user.leaveBalance[leaveType]}, Required: ${leaveDays}` 
      });
    }

    // Check monthly limit for PL and SL (max 2 per month)
    if (leaveType === 'PL' || leaveType === 'SL') {
      const startOfMonth = new Date(from.getFullYear(), from.getMonth(), 1);
      const endOfMonth = new Date(from.getFullYear(), from.getMonth() + 1, 0);

      const monthlyLeaveCount = await Leave.countDocuments({
        user: req.user._id, 
        leaveType: leaveType,
        status: { $in: ['PENDING', 'APPROVED'] },
        fromDate: { $gte: startOfMonth, $lte: endOfMonth }
      });

      if (monthlyLeaveCount >= 2) {
        return res.status(400).json({ 
          message: `Maximum 2 ${leaveType} applications allowed per month. You have already applied ${monthlyLeaveCount} times this month.` 
        });
      }
    }

    const leave = await Leave.create({
      leaveType,
      fromDate,
      toDate,
      reason,
      isHalfDay: isHalfDay || false,
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

    const leave = await Leave.findById(req.params.id).populate('user');

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

    // If approving leave, deduct from user's balance
    if (status === 'APPROVED' && leave.status !== 'APPROVED') {
      const from = new Date(leave.fromDate);
      const to = new Date(leave.toDate);
      const diffTime = Math.abs(to - from);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const leaveDays = leave.isHalfDay ? 0.5 : diffDays;

      const user = await User.findById(leave.user._id);
      
      if (user.leaveBalance[leave.leaveType] < leaveDays) {
        return res.status(400).json({ 
          message: `Insufficient leave balance for user` 
        });
      }

      user.leaveBalance[leave.leaveType] -= leaveDays;
      await user.save();
    }

    // If rejecting previously approved leave, restore balance
    if (status === 'REJECTED' && leave.status === 'APPROVED') {
      const from = new Date(leave.fromDate);
      const to = new Date(leave.toDate);
      const diffTime = Math.abs(to - from);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const leaveDays = leave.isHalfDay ? 0.5 : diffDays;

      const user = await User.findById(leave.user._id);
      user.leaveBalance[leave.leaveType] += leaveDays;
      await user.save();
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

export const getAllLeavesForSuperAdmin = async (req, res) => {
  try {
    const leaves = await Leave.find({})
      .populate({
        path: "user",
        select: "name email",
        populate: {
          path: "department",
          select: "name"
        }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: leaves,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching leaves" });
  }
};

export const updateLeaveStatusBySuperAdmin = async (req, res) => {
  try {
    const { status } = req.body;

    const leave = await Leave.findById(req.params.id).populate('user');

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    // If approving leave, deduct from user's balance
    if (status === 'APPROVED' && leave.status !== 'APPROVED') {
      const from = new Date(leave.fromDate);
      const to = new Date(leave.toDate);
      const diffTime = Math.abs(to - from);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const leaveDays = leave.isHalfDay ? 0.5 : diffDays;

      const user = await User.findById(leave.user._id);
      
      if (user.leaveBalance[leave.leaveType] < leaveDays) {
        return res.status(400).json({ 
          message: `Insufficient leave balance for user` 
        });
      }

      user.leaveBalance[leave.leaveType] -= leaveDays;
      await user.save();
    }

    // If rejecting previously approved leave, restore balance
    if (status === 'REJECTED' && leave.status === 'APPROVED') {
      const from = new Date(leave.fromDate);
      const to = new Date(leave.toDate);
      const diffTime = Math.abs(to - from);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const leaveDays = leave.isHalfDay ? 0.5 : diffDays;

      const user = await User.findById(leave.user._id);
      user.leaveBalance[leave.leaveType] += leaveDays;
      await user.save();
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

export const getUserLeaveBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('leaveBalance joiningDate probationEndDate');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get current month's leave counts for PL and SL
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [plCount, slCount] = await Promise.all([
      Leave.countDocuments({
        user: req.user._id,
        leaveType: 'PL',
        status: { $in: ['PENDING', 'APPROVED'] },
        fromDate: { $gte: startOfMonth, $lte: endOfMonth }
      }),
      Leave.countDocuments({
        user: req.user._id,
        leaveType: 'SL',
        status: { $in: ['PENDING', 'APPROVED'] },
        fromDate: { $gte: startOfMonth, $lte: endOfMonth }
      })
    ]);

    res.json({
      success: true,
      data: {
        leaveBalance: user.leaveBalance,
        joiningDate: user.joiningDate,
        probationEndDate: user.probationEndDate,
        monthlyUsage: {
          PL: plCount,
          SL: slCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUserLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    // Check if the leave belongs to the user
    if (leave.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this leave" });
    }

    // If leave was approved, restore the balance
    if (leave.status === 'APPROVED') {
      const from = new Date(leave.fromDate);
      const to = new Date(leave.toDate);
      const diffTime = Math.abs(to - from);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const leaveDays = leave.isHalfDay ? 0.5 : diffDays;

      const user = await User.findById(req.user._id);
      if (user && user.leaveBalance && user.leaveBalance[leave.leaveType] !== undefined) {
        user.leaveBalance[leave.leaveType] += leaveDays;
        await user.save();
      }
    }

    await Leave.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Leave deleted successfully"
    });
  } catch (error) {
    console.error('Delete leave error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateUserLeave = async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, reason, isHalfDay } = req.body;
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    // Check if the leave belongs to the user
    if (leave.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this leave" });
    }

    // Only allow editing pending leaves
    if (leave.status !== 'PENDING') {
      return res.status(400).json({ 
        message: "Only pending leaves can be edited" 
      });
    }

    // Validate half-day leave
    if (isHalfDay) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      
      if (from.toDateString() !== to.toDateString()) {
        return res.status(400).json({ 
          message: "Half-day leave must be for a single day" 
        });
      }
    }

    // Calculate new leave days
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to - from);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const leaveDays = isHalfDay ? 0.5 : diffDays;

    // Get user with leave balance
    const user = await User.findById(req.user._id);
    
    // Check if user has sufficient leave balance
    if (!user.leaveBalance || user.leaveBalance[leaveType] === undefined) {
      return res.status(400).json({ 
        message: `Invalid leave type: ${leaveType}` 
      });
    }

    if (user.leaveBalance[leaveType] < leaveDays) {
      return res.status(400).json({ 
        message: `Insufficient ${leaveType} balance. Available: ${user.leaveBalance[leaveType]}, Required: ${leaveDays}` 
      });
    }

    // Check monthly limit for PL and SL (max 2 per month) - exclude current leave
    if (leaveType === 'PL' || leaveType === 'SL') {
      const startOfMonth = new Date(from.getFullYear(), from.getMonth(), 1);
      const endOfMonth = new Date(from.getFullYear(), from.getMonth() + 1, 0);

      const monthlyLeaveCount = await Leave.countDocuments({
        user: req.user._id,
        leaveType: leaveType,
        status: { $in: ['PENDING', 'APPROVED'] },
        fromDate: { $gte: startOfMonth, $lte: endOfMonth },
        _id: { $ne: req.params.id } // Exclude current leave
      });

      if (monthlyLeaveCount >= 2) {
        return res.status(400).json({ 
          message: `Maximum 2 ${leaveType} applications allowed per month. You have already applied ${monthlyLeaveCount} times this month.` 
        });
      }
    }
          
    // Update leave
    leave.leaveType = leaveType;
    leave.fromDate = fromDate;
    leave.toDate = toDate;
    leave.reason = reason;
    leave.isHalfDay = isHalfDay || false;
    await leave.save();

    res.json({
      success: true,
      message: "Leave updated successfully",
      data: leave
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
