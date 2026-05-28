const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { sendSuccess } = require("./utils/response");

dotenv.config();

const app = express();

connectDB();


const corsOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((o) => o.trim())
  : true; 

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
app.use(express.json({ limit: "1mb" }));


app.get("/api/health", (req, res) => {
  sendSuccess(res, 200, "Health check successful", {
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", require("./routes/auth.router"));
app.use("/api/tasks", require("./routes/task.router"));
app.use("/api/admin", require("./routes/admin.router"));



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
