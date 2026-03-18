import Holiday from "../models/Holiday.js";

export const getHoliday = async (req, res) => {
  try {
    const holidays = await Holiday.find();
    res.status(200).json(holidays);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching holidays", error: error.message });
  }
};

export const createHoliday = async (req, res) => {
  try {
    const { title, date, type, description } = req.body;

    const newholiday = new Holiday({
      title,
      date,
      type,
      description,
    });
    const savedHoliday = await newholiday.save();
    res.status(201).json(savedHoliday);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating holiday", error: error.message });
  }
};

export const updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, type, description } = req.body;
    const updatedHoliday = await Holiday.findByIdAndUpdate(
      id,
      { title, date, type, description },
      { new: true },
    );
    if (!updatedHoliday) {
      return res.status(404).json({ message: "Holiday not found" });
    }
    res.status(200).json(updatedHoliday);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating holiday", error: error.message });
  }
};

export const deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedHoliday = await Holiday.findByIdAndDelete(id);
    if (!deletedHoliday) {
      return res.status(404).json({ message: "Holiday not found" });
    }
    res.status(200).json({ message: "Holiday deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting holiday", error: error.message });
  }
};
