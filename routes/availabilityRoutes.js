const express = require("express");
const router = express.Router();
const pool = require("../db");

// CREATE AVAILABILITY
router.post("/", async (req, res) => {
  const { day_of_week, start_time, end_time, timezone } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO availability (day_of_week, start_time, end_time, timezone) VALUES ($1,$2,$3,$4) RETURNING *",
      [day_of_week, start_time, end_time, timezone]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL AVAILABILITY
router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM availability");
  res.json(result.rows);
});

module.exports = router;