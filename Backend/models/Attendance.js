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
AttendanceSchema.pre("save", function () {
  if (!this.userId) {
    throw new Error("userId is required and cannot be null or undefined");
  }
});
const Attendance = mongoose.model("Attendance", AttendanceSchema);

export default Attendance;
