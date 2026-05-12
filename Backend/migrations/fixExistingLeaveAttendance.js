import mongoose from "mongoose";
import Leave from "../models/Leave.js";
import Attendance from "../models/Attendance.js";
import dotenv from "dotenv";

dotenv.config();

// Helper function to create attendance records for approved leave
const createAttendanceForLeave = async (leave) => {
  try {
    // Use UTC dates to avoid timezone issues
    const fromDate = new Date(leave.fromDate);
    const toDate = new Date(leave.toDate);
    
    // Set to start of day to avoid time comparison issues
    fromDate.setUTCHours(0, 0, 0, 0);
    toDate.setUTCHours(0, 0, 0, 0);
    
    console.log(`  Creating attendance for leave from ${fromDate.toISOString().split('T')[0]} to ${toDate.toISOString().split('T')[0]}`);
    
    // Generate all dates in the leave range
    const dates = [];
    const currentDate = new Date(fromDate);
    while (currentDate <= toDate) {
      dates.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(`  Generated ${dates.length} dates for leave`);

    let created = 0;
    let updated = 0;
    let skipped = 0;

    // Create or update attendance records for each date
    for (const date of dates) {
      const existingAttendance = await Attendance.findOne({
        userId: leave.user._id || leave.user,
        date: date
      });

      if (existingAttendance) {
        // Check if it's already marked as leave
        if (existingAttendance.status === "ON_LEAVE" || existingAttendance.status === "HALF_DAY_LEAVE") {
          console.log(`  ⏭️  Skipping ${date} - already marked as leave`);
          skipped++;
          continue;
        }
        
        // Update existing record - mark as on leave
        console.log(`  ✏️  Updating existing attendance for ${date}`);
        if (leave.isHalfDay) {
          existingAttendance.status = "HALF_DAY_LEAVE";
        } else {
          existingAttendance.checkIn = null;
          existingAttendance.checkOut = null;
          existingAttendance.breaks = [];
          existingAttendance.status = "ON_LEAVE";
        }
        await existingAttendance.save();
        updated++;
      } else {
        console.log(`  ✅ Creating new attendance record for ${date}`);
        // Create new attendance record for leave
        await Attendance.create({
          userId: leave.user._id || leave.user,
          date: date,
          checkIn: null,
          checkOut: null,
          breaks: [],
          status: leave.isHalfDay ? "HALF_DAY_LEAVE" : "ON_LEAVE"
        });
        created++;
      }
    }
    
    return { created, updated, skipped };
  } catch (error) {
    console.error("  ❌ Error creating attendance for leave:", error.message);
    throw error;
  }
};

async function migrateExistingLeaves() {
  try {
    console.log("🚀 Starting migration: Creating attendance records for existing approved leaves\n");
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find all approved leaves
    const approvedLeaves = await Leave.find({ status: 'APPROVED' })
      .populate('user', 'name email')
      .sort({ fromDate: 1 });
    
    console.log(`📋 Found ${approvedLeaves.length} approved leaves\n`);

    if (approvedLeaves.length === 0) {
      console.log("✨ No approved leaves found. Migration complete!\n");
      process.exit(0);
    }

    let totalCreated = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    // Process each leave
    for (let i = 0; i < approvedLeaves.length; i++) {
      const leave = approvedLeaves[i];
      console.log(`\n[${i + 1}/${approvedLeaves.length}] Processing leave for ${leave.user?.name || 'Unknown User'}`);
      console.log(`  Leave Type: ${leave.leaveType}`);
      console.log(`  From: ${new Date(leave.fromDate).toISOString().split('T')[0]}`);
      console.log(`  To: ${new Date(leave.toDate).toISOString().split('T')[0]}`);
      console.log(`  Half Day: ${leave.isHalfDay ? 'Yes' : 'No'}`);
      
      try {
        const result = await createAttendanceForLeave(leave);
        totalCreated += result.created;
        totalUpdated += result.updated;
        totalSkipped += result.skipped;
        console.log(`  ✅ Success: ${result.created} created, ${result.updated} updated, ${result.skipped} skipped`);
      } catch (error) {
        totalErrors++;
        console.log(`  ❌ Failed: ${error.message}`);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 Migration Summary:");
    console.log("=".repeat(60));
    console.log(`Total Leaves Processed: ${approvedLeaves.length}`);
    console.log(`Attendance Records Created: ${totalCreated}`);
    console.log(`Attendance Records Updated: ${totalUpdated}`);
    console.log(`Attendance Records Skipped: ${totalSkipped}`);
    console.log(`Errors: ${totalErrors}`);
    console.log("=".repeat(60));
    console.log("\n✨ Migration complete!\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
migrateExistingLeaves();
