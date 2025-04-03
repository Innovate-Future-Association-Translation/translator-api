import nodemailer from "nodemailer";
import config from "../config";
import { authErrorMessages } from "../utils/errorMessages";
import emailGenerator from "../templates/verificationEmailTemplate";

export const sendVerificationEmail = async (
  email: string,
  token: string,
  receiverName:string
): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.emailUser,
        pass: config.emailPasskey,
      },
    });

    const verificationLink = `${config.emailRedirectURL}/api/v1/users/verify-email?token=${token}`;

    const mailOptions = emailGenerator(verificationLink, email,receiverName);
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error(authErrorMessages.SENDING_EMAIL_ERROR);
  }
};
