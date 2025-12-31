const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // 👈 tumhara email
    pass: process.env.EMAIL_PASS, // 👈 app password
  },
});

const sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: `"Sparkling Car Wash" <${process.env.EMAIL_USER}>`,
    to,             // 👈 USER ka email
    subject,
    html,
  });
};

module.exports = sendEmail;
