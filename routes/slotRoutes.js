const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/:eventId/:date", async (req, res) => {
  try {
    const { eventId, date } = req.params;

    // 1. Get event
    const eventRes = await pool.query(
      "SELECT * FROM event_types WHERE id=$1",
      [eventId]
    );

    if (eventRes.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    const duration = Number(eventRes.rows[0].duration);

    // 2. Day
    const day = new Date(date).getDay();

    // 3. Availability
    const availRes = await pool.query(
      "SELECT * FROM availability WHERE day_of_week=$1",
      [day]
    );

    if (availRes.rows.length === 0) {
      return res.json([]);
    }

    const { start_time, end_time } = availRes.rows[0];

    // 4. SAFE TIME BUILD (NO STRING PARSING BUG)
    const [sh, sm] = start_time.split(":");
    const [eh, em] = end_time.split(":");

    let current = new Date(date);
    current.setHours(Number(sh), Number(sm), 0, 0);

    let end = new Date(date);
    end.setHours(Number(eh), Number(em), 0, 0);

    const step = duration * 60000;

    let slots = [];

    while (current.getTime() + step <= end.getTime()) {
      slots.push(current.toTimeString().slice(0, 5));
      current = new Date(current.getTime() + step);
    }

    // 5. Booked slots normalization
    const bookings = await pool.query(
      "SELECT start_time FROM bookings WHERE booking_date=$1",
      [date]
    );

    const booked = bookings.rows.map(b =>
      String(b.start_time).slice(0, 5)
    );

    // 6. Filter
    slots = slots.filter(slot => !booked.includes(slot));

    return res.json(slots);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;