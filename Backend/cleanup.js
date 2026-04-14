import mongoose from "mongoose";
import dotenv from "dotenv";
import Attendance from "./models/Attendance.js";

dotenv.config();

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");

    // Step 1: Drop conflicting indexes
    console.log("\n[STEP 1] Dropping old/conflicting indexes...");
    try {
      await Attendance.collection.dropIndex("user_1_date_1");
      console.log("✓ Dropped old 'user_1_date_1' index");
    } catch (err) {
      console.log("✓ Old 'user_1_date_1' index not found (OK)");
    }

    try {
      await Attendance.collection.dropIndex("userId_1_date_1");
      console.log("✓ Dropped 'userId_1_date_1' index");
    } catch (err) {
      console.log("✓ 'userId_1_date_1' index not found (OK)");
    }

    // Step 2: Delete invalid records
    console.log("\n[STEP 2] Cleaning up invalid records...");

    const nullRecords = await Attendance.find({ userId: null });
    console.log(`Found ${nullRecords.length} records with null userId`);

    if (nullRecords.length > 0) {
      const result = await Attendance.deleteMany({ userId: null });
      console.log(`✓ Deleted ${result.deletedCount} records with null userId`);
    }

    const undefinedRecords = await Attendance.find({
      userId: { $exists: false },
    });
    console.log(`Found ${undefinedRecords.length} records with missing userId`);

    if (undefinedRecords.length > 0) {
      const result = await Attendance.deleteMany({
        userId: { $exists: false },
      });
      console.log(
        `✓ Deleted ${result.deletedCount} records with missing userId`,
      );
    }

    // Step 3: Recreate proper indexes
    console.log("\n[STEP 3] Creating proper indexes...");
    await Attendance.collection.createIndex(
      { userId: 1, date: 1 },
      { unique: true },
    );
    console.log("✓ Created unique compound index on userId and date");

    // Step 4: Verify
    console.log("\n[STEP 4] Verifying cleanup...");
    const totalRecords = await Attendance.countDocuments();
    const validRecords = await Attendance.countDocuments({
      userId: { $exists: true, $ne: null },
    });
    console.log(`Total attendance records: ${totalRecords}`);
    console.log(`Valid records (with userId): ${validRecords}`);

    console.log("\nCleanup completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Cleanup error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

cleanup();
