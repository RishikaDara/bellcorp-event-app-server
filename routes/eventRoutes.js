const express = require("express");
const Event = require("../models/Event");

const router = express.Router();

// GET ALL EVENTS + FILTER
router.get("/", async (req, res) => {
  const { search, category, location } = req.query;

  let query = {};

  if (search) query.name = { $regex: search, $options: "i" };
  if (category) query.category = category;
  if (location) query.location = location;

  const events = await Event.find(query);
  res.json(events);
});

// GET SINGLE EVENT
router.get("/:id", async (req, res) => {
  const event = await Event.findById(req.params.id);
  res.json(event);
});

module.exports = router;
