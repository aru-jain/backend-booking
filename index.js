const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server running");
});
const pool = require("./db");

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Connected:", res.rows);
  }
});


const eventRoutes = require("./routes/eventRoutes");

app.use("/events", eventRoutes);
const availabilityRoutes = require("./routes/availabilityRoutes");

app.use("/availability", availabilityRoutes);


const slotRoutes = require("./routes/slotRoutes");

app.use("/slots", slotRoutes);

const bookingRoutes = require("./routes/bookingRoutes");

app.use("/bookings", bookingRoutes);

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});