import nodemailer from 'nodemailer';

// Create reusable transporter with flexible config
const createTransporter = async () => {
  // Prefer explicit SMTP_* variables; fallback to service shortcut (e.g. gmail)
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    EMAIL_SERVICE,
    EMAIL_USER,
    EMAIL_PASSWORD
  } = process.env;

  // Support both naming styles (SMTP_* or EMAIL_*) for convenience
  const user = SMTP_USER || EMAIL_USER;
  const pass = SMTP_PASS || EMAIL_PASSWORD;

  // If no credentials, stay in dev mode (console log)
  if (!user || !pass) {
    console.warn('⚠️  No SMTP credentials found (SMTP_USER/SMTP_PASS or EMAIL_USER/EMAIL_PASSWORD). Using dev console logging.');
    console.warn('    Set real credentials in your .env to enable actual email delivery.');
    return null;
  }

  let transportConfig;
  if (SMTP_HOST) {
    // Explicit host/port configuration
    transportConfig = {
      host: SMTP_HOST,
      port: SMTP_PORT ? Number(SMTP_PORT) : 587,
      secure: SMTP_SECURE ? SMTP_SECURE === 'true' : Number(SMTP_PORT) === 465, // true for 465, false otherwise
      auth: { user, pass },
    };
  } else {
    // Service-based shortcut (e.g., 'gmail')
    transportConfig = {
      service: EMAIL_SERVICE || 'gmail',
      auth: { user, pass },
    };
  }

  try {
    const transporter = nodemailer.createTransport(transportConfig);
    // Verify connection config (non-fatal if fails)
    transporter.verify().then(() => {
      console.log('✅ Email transporter verified: ready to send');
    }).catch(err => {
      console.warn('⚠️  Transport verification failed (will still attempt sends):', err.message);
    });
    return transporter;
  } catch (err) {
    console.error('❌ Failed creating email transporter:', err.message);
    return null;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, userName) => {
  const transporter = await createTransporter();

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetLink = `${frontendUrl.replace(/\/$/, '')}/reset-password?token=${resetToken}`; // ensure no double slash

  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@meddirect.com',
    to: email,
    subject: 'MedDirect - Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(to right, #4F46E5, #7C3AED); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 14px 28px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello ${userName || 'User'},</p>
            <p>We received a request to reset your password for your MedDirect account.</p>
            <p>Click the button below to create a new password:</p>
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #4F46E5;">${resetLink}</p>
            <div class="warning">
              <strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons.
            </div>
            <p><strong>If you didn't request this password reset</strong>, please ignore this email. Your password will remain unchanged.</p>
            <p>For security reasons, never share this link with anyone.</p>
          </div>
          <div class="footer">
            <p>© 2024 MedDirect. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    if (!transporter) {
      // Log to console if no transporter (development mode)
      console.log('\n📧 ========== PASSWORD RESET EMAIL (DEV MODE) ==========');
      console.log('To:', email);
      console.log('Subject:', mailOptions.subject);
      console.log('Reset Link:', resetLink);
      console.log('Token:', resetToken);
      console.log('Valid for: 1 hour');
      console.log('====================================================\n');
      return { success: true, devMode: true };
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    // If using Ethereal, provide preview URL for quick inspection
    try {
      const previewUrl = nodemailer.getTestMessageUrl?.(info);
      if (previewUrl) {
        console.log('🔎 Preview email at:', previewUrl);
      }
    } catch {}
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw error;
  }
};

// Send password reset confirmation email
export const sendPasswordResetConfirmation = async (email, userName) => {
  const transporter = await createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@meddirect.com',
    to: email,
    subject: 'MedDirect - Password Successfully Reset',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(to right, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
          .info-box { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">✅ Password Reset Successful</h1>
          </div>
          <div class="content">
            <p>Hello ${userName || 'User'},</p>
            <p>This email confirms that your password has been successfully reset.</p>
            <div class="info-box">
              <strong>🔒 Your account is now secure with your new password.</strong>
            </div>
            <p>You can now log in to your MedDirect account using your new password.</p>
            <p><strong>If you did not make this change</strong>, please contact our support team immediately.</p>
            <p>For your security, we recommend:</p>
            <ul>
              <li>Using a strong, unique password</li>
              <li>Not sharing your password with anyone</li>
              <li>Changing your password regularly</li>
            </ul>
          </div>
          <div class="footer">
            <p>© 2024 MedDirect. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    if (!transporter) {
      console.log('\n📧 ========== PASSWORD RESET CONFIRMATION (DEV MODE) ==========');
      console.log('To:', email);
      console.log('Subject:', mailOptions.subject);
      console.log('=============================================================\n');
      return { success: true, devMode: true };
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset confirmation sent:', info.messageId);
    try {
      const previewUrl = nodemailer.getTestMessageUrl?.(info);
      if (previewUrl) {
        console.log('🔎 Preview email at:', previewUrl);
      }
    } catch {}
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
    // Don't throw - confirmation email failure shouldn't block password reset
    return { success: false, error: error.message };
  }
};
