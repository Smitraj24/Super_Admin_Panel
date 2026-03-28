import mongoose from "mongoose";

const breakSchema = new mongoose.Schema({
  breakIn: Date,
  breakOut: Date,
});

const AttendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    checkIn: {
      type: Date,
      default: null,
    },
    checkOut: {
      type: Date,
      default: null,
    },
    breaks: {
      type: [breakSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["CHECKED_IN", "ON_BREAK", "BACK_TO_WORK", "CHECKED_OUT"],
      default: "CHECKED_IN",
    },
  },
  { timestamps: true },
);

// Add unique compound index for userId and date combination
AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

// Pre-save validation to prevent null userId
AttendanceSchema.pre("save", function (next) {
  if (!this.userId) {
    const error = new Error(
      "userId is required and cannot be null or undefined",
    );
    return next(error);
  }
  next();
});

// Pre-create validation to prevent null userId
AttendanceSchema.pre("create", function (next) {
  if (!this.userId) {
    const error = new Error(
      "userId is required and cannot be null or undefined",
    );
    return next(error);
  }
  next();
});

const Attendance = mongoose.model("Attendance", AttendanceSchema);

// Drop old indexes and recreate on model load (handles migration)
Attendance.collection.dropIndex("user_1_date_1").catch(() => {
  // Index may not exist, which is fine
});

export default Attendance;
