import nodemailer from "nodemailer";

const getTransporter = () => {
  if (process.env.EMAIL_TRANSPORT === "json") {
    return nodemailer.createTransport({ jsonTransport: true });
  }

  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error("Password reset email transport is not configured");
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

export const sendPasswordResetOtp = async (email, otp) => {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: "Your VoltRide password reset code",
    text: `Your VoltRide password reset code is ${otp}. It expires in 10 minutes.`,
    html: `<p>Your VoltRide password reset code is <strong>${otp}</strong>.</p><p>This code expires in 10 minutes.</p>`,
  });
};