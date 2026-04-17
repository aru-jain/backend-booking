const express = require("express");
const router = express.Router();
const pool = require("../db");

// CREATE EVENT
router.post("/", async (req, res) => {
  const { title, description, duration, slug } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO event_types (title, description, duration, slug) VALUES ($1,$2,$3,$4) RETURNING *",
      [title, description, duration, slug]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL EVENTS
router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM event_types");
  res.json(result.rows);
});
router.put("/:id", async (req, res) => {
  try {
    const { title, duration, slug } = req.body;

    await pool.query(
      "UPDATE event_types SET title=$1, duration=$2, slug=$3 WHERE id=$4",
      [title, duration, slug, req.params.id]
    );

    res.json({ message: "Updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// DELETE EVENT
router.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM event_types WHERE id=$1", [req.params.id]);
  res.send("Deleted");
});

module.exports = router;