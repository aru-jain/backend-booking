const express = require("express");
const router = express.Router();
const pool = require("../db");

// CREATE BOOKING
router.post("/", async (req, res) => {
  const { event_type_id, name, email, booking_date, start_time } = req.body;

  try {
    // 1. Check if already booked
    const existing = await pool.query(
      "SELECT * FROM bookings WHERE booking_date=$1 AND start_time=$2",
      [booking_date, start_time]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Slot already booked" });
    }

    // 2. Get event duration
    const eventRes = await pool.query(
      "SELECT duration FROM event_types WHERE id=$1",
      [event_type_id]
    );

    const duration = eventRes.rows[0].duration;

    // 3. Calculate end time
    let start = new Date(`${booking_date}T${start_time}`);
    let end = new Date(start.getTime() + duration * 60000);

    let end_time = end.toTimeString().slice(0,5);

    // 4. Insert booking
    const result = await pool.query(
      `INSERT INTO bookings 
       (event_type_id, name, email, booking_date, start_time, end_time)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [event_type_id, name, email, booking_date, start_time, end_time]
    );

    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL BOOKINGS
router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM bookings ORDER BY booking_date");
  res.json(result.rows);
});

// CANCEL BOOKING
router.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM bookings WHERE id=$1", [req.params.id]);
  res.send("Booking cancelled");
});

module.exports = router;