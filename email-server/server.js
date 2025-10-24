const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const express = require("express");
const cors = require("cors");
const sendEmail = require("./emailService");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const allowed = [
  /^https:\/\/code-the-future-hybrid\.web\.app$/,
  /^https:\/\/code-the-future-hybrid--.*\.web\.app$/,
  /^http:\/\/localhost:\d+$/,
];

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      const ok = allowed.some((r) => (r.test ? r.test(origin) : r === origin));
      cb(ok ? null : new Error("CORS: origin not allowed"), ok);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("/send-email", (req, res) => res.sendStatus(204));

app.get("/health", (req, res) => res.status(200).json({ message: "Server is running" }));

app.post("/send-email", async (req, res) => {
  const { to, subject, text, html, replyTo } = req.body || {};

  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({ message: "Missing required fields: to, subject, and text|html" });
  }

  try {
    const result = await sendEmail(to, subject, text, html, replyTo);
    if (result.success) return res.status(200).json({ message: "Email sent", info: result.info });
    return res.status(502).json({ message: "Failed to send email", error: result.error });
  } catch (err) {
    console.error("Unhandled server error:", err);
    return res.status(500).json({ message: "Unexpected server error" });
  }
});

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
