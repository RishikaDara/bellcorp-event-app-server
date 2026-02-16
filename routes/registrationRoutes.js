const express = require("express");
const Registration = require("../models/Registration");
const Event = require("../models/Event");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// REGISTER FOR EVENT
router.post("/:eventId", protect, async (req, res) => {
  const event = await Event.findById(req.params.eventId);

  if (!event) return res.status(404).json({ message: "Event not found" });

  const count = await Registration.countDocuments({ event: event._id });
  if (count >= event.capacity)
    return res.status(400).json({ message: "Event Full" });

  const exists = await Registration.findOne({
    user: req.user._id,
    event: event._id,
  });

  if (exists)
    return res.status(400).json({ message: "Already Registered" });

  const reg = await Registration.create({
    user: req.user._id,
    event: event._id,
  });

  res.json(reg);
});

// MY EVENTS
router.get("/my-events", protect, async (req, res) => {
  const regs = await Registration.find({ user: req.user._id }).populate("event");
  res.json(regs);
});

// DELETE REGISTRATION
router.delete("/:id", protect, async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id);

    if (!reg) return res.status(404).json({ message: "Registration not found" });

    // Only the user who registered can delete
    if (reg.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await reg.remove();
    res.json({ message: "Registration deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

