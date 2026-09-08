import nodemailer from "nodemailer";

const sanitizeErrorMessage = (error) => {
  let message = error?.message || "Email delivery failed";
  const appPassword = process.env.EMAIL_APP_PASSWORD?.trim();
  if (appPassword) {
    message = message.split(appPassword).join("[REDACTED]");
  }
  return message;
};

export const getTransporter = () => {
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailAppPassword = process.env.EMAIL_APP_PASSWORD?.trim();

  if (!emailUser || !emailAppPassword) {
    throw new Error(
      "Email delivery service is not configured: EMAIL_USER and EMAIL_APP_PASSWORD are required"
    );
  }

  // Optional custom SMTP configuration (useful for automated testing/mock SMTP servers)
  if (process.env.EMAIL_HOST) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: emailUser,
        pass: emailAppPassword,
      },
    });
  }

  // Default: Gmail SMTP service
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailAppPassword,
    },
  });
};

export const sendPasswordResetOtp = async (email, otp) => {
  const emailUser = process.env.EMAIL_USER?.trim();
  const transporter = getTransporter();

  const textContent = `Hello,

Your VoltRide password reset OTP is:

${otp}

This OTP expires in 10 minutes.

Do not share this OTP with anyone.

If you did not request a password reset, you can safely ignore this email.`;

  const htmlContent = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1f2937; line-height: 1.6; border: 1px solid #e5e7eb; border-radius: 8px;">
  <h2 style="color: #059669; margin-bottom: 16px;">VoltRide Password Reset</h2>
  <p>Hello,</p>
  <p>Your VoltRide password reset OTP is:</p>
  <div style="background-color: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0;">
    <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #111827;">${otp}</span>
  </div>
  <p style="margin-bottom: 8px;"><strong>This OTP expires in 10 minutes.</strong></p>
  <p style="color: #dc2626; font-size: 14px; margin-bottom: 20px;">Do not share this OTP with anyone.</p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
  <p style="font-size: 13px; color: #6b7280; margin: 0;">If you did not request a password reset, you can safely ignore this email.</p>
</div>`;

  try {
    const info = await transporter.sendMail({
      from: `VoltRide <${emailUser}>`,
      to: email,
      subject: "VoltRide Password Reset OTP",
      text: textContent,
      html: htmlContent,
    });

    console.log("Password reset email sent successfully");
    return info;
  } catch (error) {
    const safeError = sanitizeErrorMessage(error);
    throw new Error(safeError);
  }
};