const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!to || typeof to !== "string" || !to.includes("@")) {
      throw new Error(`Invalid recipient email: ${to}`);
    }

    console.log("EMAIL DEBUG:", {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS ? "OK" : "MISSING",
      client_url: process.env.CLIENT_URL
    });

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // SSL
      auth: {
        user: process.env.EMAIL_USER,  // your Google Workspace email
        pass: process.env.EMAIL_PASS,  // App Password
      },
    });

    const mailOptions = {
      from: `"Dhatvibs HR" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent to:", to);
  } catch (err) {
    console.error("❌ Email send error:", err.message);
    throw err;
  }
};

module.exports = sendEmail;
