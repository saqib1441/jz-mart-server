import nodemailer from "nodemailer";

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendEmail = async (email, subject, otp) => {
  const formattedOtp = otp.toString().replace(/(\d{3})(\d{3})/, "$1-$2");

  const mailOptions = {
    from: `"JZ Mart" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <div style="text-align: center; padding-bottom: 10px;">
          <img src="https://storage.googleapis.com/shy-pub/207197/1672375853296_hdlogo.jpeg" alt="JZ Mart" style="width: 120px;">
        </div>
        <h2 style="color: #333; text-align: center;">Email Verification Code</h2>
        <p style="color: #555; font-size: 16px; text-align: center;">Dear Customer,</p>
        <p style="color: #555; font-size: 16px; text-align: center;">
          Use the verification code below to complete your sign-up process. The code is valid for <strong>10 minutes</strong>.
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 24px; font-weight: bold; color: #007BFF; background: #f1f1f1; padding: 10px 20px; border-radius: 6px; display: inline-block;">
            ${formattedOtp}
          </span>
        </div>
        <p style="color: #555; font-size: 16px; text-align: center;">
          If you did not request this, please ignore this email.
        </p>
        <p style="color: #999; font-size: 14px; text-align: center; margin-top: 20px;">
          © ${new Date().getFullYear()} JZ Mart. All rights reserved.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
