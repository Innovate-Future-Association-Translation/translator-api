import config from '../config';

type EmailTemplate = {
  from: string;
  to: string;
  subject: string;
  html: string;
};

const generateForgetPasswordEmail = (
  resetLink: string,
  receiverEmail: string,
  receiverName: string
): EmailTemplate => {
  return {
    from: config.emailUser,
    to: receiverEmail,
    subject: 'IFA Translator - Reset Your Password',
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1)">
      <h2 style="color: #2C3E50;">Reset Your Password</h2>
      <p>Dear ${receiverName},</p>
      <p>You requested to reset your password. Click the button below to continue:</p>
      <a href="${resetLink}" style="display:inline-block;padding:10px 20px;background:#E67E22;color:white;border-radius:5px;text-decoration:none;">Reset Password</a>
      <p>This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
      <hr/>
      <p style="font-size: 12px; color: #888;">IFA Translator Team | ${config.emailUser}</p>
    </div>
    `,
  };
};

export default generateForgetPasswordEmail;
