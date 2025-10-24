const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.maileroo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAILEROO_USER,
    pass: process.env.MAILEROO_PASS,
  },
  logger: true,
  debug: true,
});

transporter.verify().then(
  () => console.log("[mail] SMTP connection OK"),
  (err) => console.error("[mail] SMTP verify failed:", err?.message || err)
);

async function sendEmail(to, subject, text, html, replyTo = process.env.MAIL_REPLY_TO) {
  const mailOptions = {
    from: process.env.MAIL_FROM,
    to,
    subject,
    text,
    html,
    replyTo,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("[mail] Sent:", { messageId: info.messageId, envelope: info.envelope });
    return { success: true, info: { messageId: info.messageId } };
  } catch (error) {
    console.error("[mail] Send failed:", error?.response || error?.message || error);
    return { success: false, error: error?.response || error?.message || "Unknown SMTP error" };
  }
}

module.exports = sendEmail;
