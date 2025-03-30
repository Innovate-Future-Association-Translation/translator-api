import nodemailer from "nodemailer";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const CLIENT_ID = process.env.OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

export const sendVerificationEmail = async (
  email: string,
  token: string
): Promise<void> => {
  try {
    console.log("oauthclient is ", oauth2Client);
    console.log("Fetching access token...");
    const accessToken = await oauth2Client.getAccessToken();

    if (!accessToken || !accessToken.token) {
      throw new Error("Failed to retrieve access token");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER || "ifatranslator@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token, // use the access token directly
      },
    });

    const verificationLink = `${
      process.env.BASE_URL || "http://localhost:8000"
    }/api/v1/users/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER || "ifatranslator@gmail.com",
      to: email,
      subject: "Email Verification",
      html: `
            <h3>Welcome to register!</h3>
            <p>Please click this link to activate your account:</p>
            <a href="${verificationLink}">Verify your email</a>
            <p>This link expires after 24 hours</p>
        `,
    };

    console.log("Sending email...");
    await transporter.sendMail(mailOptions); // Sending the email

    console.log("Verification email sent successfully!");
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};
