import User from "../models/User.models.js";

/**
 * Middleware to automatically refill monthly leaves (PL and SL)
 * - Checks if a new month has started since last refill
 * - Refills PL to 1 and SL to 1 each month
 * - CL remains unlimited (999)
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

      // Refill monthly leaves
      user.leaveBalance.PL = 1;
      user.leaveBalance.SL = 1;

      // Ensure CL remains unlimited
      if (user.leaveBalance.CL < "♾️") {
        user.leaveBalance.CL = "♾️";
      }

      user.lastLeaveRefill = now;
      await user.save();

      console.log(` Leaves refilled: PL=1, SL=1, CL= ♾️ `);

      // Update req.user with new balance
      req.user.leaveBalance = user.leaveBalance;
    }

    next();
  } catch (error) {
    console.error("Error in autoRefillLeaves middleware:", error);
    next(); // Continue even if refill fails
  }
};
