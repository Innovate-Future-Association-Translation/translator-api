import config from "../config";

const emailContent = {
  welcomeText: "Welcome to IFA-translator registration!",
  notificationText: "Please click this button to activate your account:",
  buttonText: "Verify your email",
  expiryText: "This link expires after 24 hours",
  email:config.emailUser,
  address:"IFA Sydney Office"
};

type EmailTemplate = {
  from: string;
  to: string;
  subject: string;
  html: string;
};

const emailGenerator = (
  verificationLink: string,
  receiverEmail: string,
  receiverName: string
): EmailTemplate => {
  const emailToBeSend: EmailTemplate = {
    from: config.emailUser,
    to: receiverEmail,
    subject: "Email Verification for your IFA Account",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Verification</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f6f9;
            color: #333;
            line-height: 1.6;
        }
        table {
            border-spacing: 0;
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
        }
        td {
            padding: 20px;
            text-align: left;
        }
        .header {
            background-color: #2C3E50;
            color: #ffffff;
            font-size: 28px;
            font-weight: bold;
            padding: 20px 0;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header img {
            width: 40px;
            vertical-align: middle;
            margin-right: 10px;
           
        }
        .content {
            background-color: #ffffff;
            color: #333;
            font-size: 16px;
            font-weight: normal;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .content p {
            font-size: 16px;
            margin-bottom: 10px;
        }
        .button {
            background-color:#E67E22 ;
            color: white;
            padding: 15px 30px;
            font-size: 18px;
            font-weight: bold;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
            margin: 20px 0;
        }
        .button:hover{
            background-color:#e04e2f ;
        }
        .footer {
            font-size: 13px;
            color:#333333;
            background-color: #3498DB;
            padding: 20px;
            text-align: left;
            border-top: 1px solid #ccc;
            box-shadow: 0 -4px 6px rgba(0, 0, 0, 0.1);
        }
        .footer p {
            margin: 5px 0;
        }
        .social-icons img {
            width: 32px;
            margin-right: 15px;
            vertical-align: middle;
        }
        @media (max-width: 600px) {
            .header {
                font-size: 24px;
                padding: 15px 0;
            }
            .content {
                padding: 20px;
                font-size: 14px;
            }
            .button {
                font-size: 16px;
                padding: 12px 25px;
            }
         
        }
    </style>
</head>
<body>
    <table>
        <!-- Header Section -->
        <tr>
            <td class="header">
                <img src = "https://cdn.templates.unlayer.com/assets/1593141680866-reset.png"/>
                Email Verification
            </td>
        </tr>

        <!-- Content Section -->
        <tr>
            <td class="content">
                <p>Dear ${receiverName},</p>
                <p>Thank you for registering with us! To complete the verification process, please click the button below.</p>
                <p><a href="${verificationLink}" class="button">${emailContent.buttonText}</a></p>
                <p>This link will expire in 24 hours, so be sure to verify your email soon.</p>
                <p>If you didn't sign up for an account, please disregard this email.</p>
                <p>Best regards,<br/><strong>The IFA Translator Team</strong></p>
            </td>
        </tr>

        <!-- Footer Section -->
        <tr>
            <td class="footer">
                <p style="font-size: 18px;"><strong>Contact Information:</strong></p>
                <p>Address:${emailContent.address}</p>
                <p>Email: <span>${emailContent.email}</span></p>
                <div class="social-icons">
                    <a href="https://facebook.com" target="_blank">
                        <img src="https://cdn.tools.unlayer.com/social/icons/circle-white/facebook.png" alt="Facebook" />
                    </a>
                    <a href="https://twitter.com" target="_blank">
                        <img src="https://cdn.tools.unlayer.com/social/icons/circle-white/twitter.png" alt="Twitter" />
                    </a>
                    <a href="https://instagram.com" target="_blank">
                        <img src="https://cdn.tools.unlayer.com/social/icons/circle-white/instagram.png" alt="Instagram" />
                    </a>
                    <a href="https://linkedin.com" target="_blank">
                        <img src="https://cdn.tools.unlayer.com/social/icons/circle-white/linkedin.png" alt="LinkedIn" />
                    </a>
                </div>
                <p>Company © ${new Date().getFullYear()} All Rights Reserved</p>
            </td>
        </tr>
    </table>
</body>
</html>`,
  };

  return emailToBeSend;
};

export default emailGenerator;
