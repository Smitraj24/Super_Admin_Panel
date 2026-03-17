import mongoose from "mongoose";

const HolidaySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    enum: ["national", "festival", "company"],
    default: "festival",
  },
  description: {
    type: String,
  },
});

export default mongoose.model("Holiday", HolidaySchema);
