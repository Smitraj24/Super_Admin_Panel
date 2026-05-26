import User from "../models/User.models.js";
import Leave from "../models/Leave.js";

/**
 * Middleware to automatically refill monthly leaves (PL and SL)
 * - Checks if a new month has started since last refill
 * - Refills PL to 1 and SL to 1 each month
 * - CL remains unlimited (999)
 * - Adds unused PL/CL from previous month to DL balance
 */
export const autoRefillLeaves = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return next();
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return next();
    }

    const now = new Date();
    const lastRefill = user.lastLeaveRefill
      ? new Date(user.lastLeaveRefill)
      : new Date(0);

    // Check if we're in a new month
    const isNewMonth =
      now.getMonth() !== lastRefill.getMonth() ||
      now.getFullYear() !== lastRefill.getFullYear();

    if (isNewMonth) {
      console.log(
        `🔄 Auto-refilling leaves for user: ${user.name} (${user.email})`,
      );

      // Check previous month's PL and CL usage
      const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const previousMonthLeaves = await Leave.countDocuments({
        user: req.user._id,
        leaveType: { $in: ["PL", "CL"] },
        status: { $in: ["PENDING", "APPROVED"] },
        fromDate: { $gte: previousMonthStart, $lte: previousMonthEnd },
      });

      // If no PL or CL was taken in previous month, add 1 to DL balance
      if (previousMonthLeaves === 0) {
        user.leaveBalance.DL = (user.leaveBalance.DL || 0) + 1;
        console.log(`✅ Added 1 DL (no PL/CL taken in previous month). New DL balance: ${user.leaveBalance.DL}`);
      } else {
        console.log(`ℹ️ No DL added (${previousMonthLeaves} PL/CL taken in previous month)`);
      }

      // Refill monthly leaves
      user.leaveBalance.PL = 1;
      user.leaveBalance.SL = 1;

      // Ensure CL remains unlimited
      if (user.leaveBalance.CL < "♾️") {
        user.leaveBalance.CL = "♾️";
      }

      user.lastLeaveRefill = now;
      await user.save();

      console.log(`✅ Leaves refilled: PL=1, SL=1, CL=♾️, DL=${user.leaveBalance.DL}`);

      // Update req.user with new balance
      req.user.leaveBalance = user.leaveBalance;
    }

    next();
  } catch (error) {
    console.error("Error in autoRefillLeaves middleware:", error);
    next(); // Continue even if refill fails
  }
};
