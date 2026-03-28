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
    },
    date: {
      type: String,
      required: true,
    },
    checkIn: Date,
    checkOut: Date,
    breaks: [breakSchema],
    status: {
      type: String,
      enum: ["CHECKED_IN", "ON_BREAK", "BACK_TO_WORK", "CHECKED_OUT"],
      default: "CHECKED_IN",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Attendance", AttendanceSchema);
