import Attendance from "../models/Attendance.js";
const getToday = () => new Date().toISOString().split("T")[0];

export const checkIn = async (req, res) => {
  try {
    const { userId } = req.body;
    const today = getToday();

    const existing = await Attendance.findOne({ userId, date: today });
    if (existing)
      return res.status(400).json({ message: "Already checked in" });

    const record = await Attendance.create({
      userId,
      date: today,
      checkIn: new Date(),
      status: "CHECKED_IN",
    });

    res.json({ message: "Checked in successfully", record });
  } catch (error) {
    res.status(500).json({ message: "Error checking in", error });
  }
};

export const breakIn = async (req, res) => {
  try {
    const { userId } = req.body;

    const today = getToday();

    const record = await Attendance.findOne({ userId, date: today });

    if (!record || !["CHECKED_IN", "BACK_TO_WORK"].includes(record.status)) {
      return res.status(400).json({ message: "Cannot start break" });
    }

    record.breaks.push({ breakIn: new Date() });
    record.status = "ON_BREAK";

    await record.save();

    res.json({ message: "Break started", record });
  } catch (error) {
    res.status(500).json({ message: "Error starting break", error });
  }
};

export const breakOut = async (req, res) => {
  try {
    const { userId } = req.body;
    const today = getToday();

    const record = await Attendance.findOne({ userId, date: today });
    if (!record || record.status !== "ON_BREAK") {
      return res.status(400).json({ message: "Cannot end break" });
    }

    const lastBreak = record.breaks[record.breaks.length - 1];
    if (!lastBreak || lastBreak.breakOut) {
      return res.status(400).json({ message: "No active break found" });
    }

    lastBreak.breakOut = new Date();
    record.status = "BACK_TO_WORK";

    await record.save();
    res.json({ message: "Break ended", record });
  } catch (error) {
    res.status(500).json({ message: "Error ending break", error });
  }
};

export const checkOut = async (req, res) => {
  try {
    const { userId } = req.body;
    const today = getToday();

    const record = await Attendance.findOne({ userId, date: today });
    if (!record || record.status === "CHECKED_OUT") {
      return res.status(400).json({ message: "Cannot check out" });
    }

    record.checkOut = new Date();
    record.status = "CHECKED_OUT";
    await record.save();

    res.json({ message: "Checked out successfully", record });
  } catch (error) {
    res.status(500).json({ message: "Error checking out", error });
  }
};

export const getTodayStatus = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId || req.body.userId;
    const today = getToday();

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const record = await Attendance.findOne({ userId, date: today });

    if (!record) {
      return res.json({ status: "NOT_CHECKED_IN" });
    }
    res.json({ status: record.status, record });
  } catch (error) {
    res.status(500).json({ message: "Error fetching status", error });
  }
};
