import nodemailer from 'nodemailer';
import { config } from '../config';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});

export class EmailService {
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: config.email.from,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You requested a password reset for your LogisticApp account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This link will expire in 1 hour. If you didn't request this, please ignore this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const mailOptions = {
      from: config.email.from,
      to: email,
      subject: 'Welcome to LogisticApp',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to LogisticApp, ${name}!</h2>
          <p>Thank you for joining LogisticApp. We're excited to have you on board!</p>
          <p>With LogisticApp, you can:</p>
          <ul>
            <li>Manage orders efficiently</li>
            <li>Track deliveries in real-time</li>
            <li>Assign drivers and vehicles</li>
            <li>Generate reports and analytics</li>
          </ul>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            © ${new Date().getFullYear()} LogisticApp. All rights reserved.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  }
}

export const emailService = new EmailService();
