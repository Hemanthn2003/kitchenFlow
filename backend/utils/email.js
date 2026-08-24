import dotenv from "dotenv";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";


/* Load root .env */

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);

const envPath =
  path.resolve(
    __dirname,
    "../../.env"
  );


dotenv.config({
  path: envPath,
});


/* Check SMTP configuration */

console.log(
  "EMAIL HOST:",
  process.env.EMAIL_HOST
);

console.log(
  "EMAIL PORT:",
  process.env.EMAIL_PORT
);

console.log(
  "EMAIL USER:",
  process.env.EMAIL_USER
);


/* Create transporter */

const transporter =
  nodemailer.createTransport({

    host:
      process.env.EMAIL_HOST,

    port:
      Number(
        process.env.EMAIL_PORT || 587
      ),

    secure: false,

    requireTLS: true,

    auth: {

      user:
        process.env.EMAIL_USER,

      pass:
        process.env.EMAIL_PASSWORD,

    },

  });


/* Verify SMTP */

export const verifyEmailConnection =
  async () => {

    try {

      await transporter.verify();

      console.log(
        "Email SMTP connection successful"
      );

    } catch (error) {

      console.error(
        "Email SMTP connection failed:"
      );

      console.error(
        error
      );

    }

  };


/* Send OTP */

export const sendPasswordResetOTP =
  async (
    email,
    otp
  ) => {

    try {

      console.log(
        "Sending OTP to:",
        email
      );

      console.log(
        "SMTP host:",
        process.env.EMAIL_HOST
      );

      console.log(
        "SMTP port:",
        process.env.EMAIL_PORT
      );


      const mailOptions = {

        from:
          process.env.EMAIL_FROM ||
          process.env.EMAIL_USER,

        to:
          email,

        subject:
          "KitchenFlow Password Reset OTP",

        text: `
Your KitchenFlow password reset OTP is:

${otp}

This OTP is valid for 10 minutes.

If you did not request this password reset,
please ignore this email.

KitchenFlow Management System
        `,

        html: `
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>
KitchenFlow Password Reset
</title>

</head>

<body
style="
margin:0;
padding:0;
background:#050b18;
font-family:Arial,sans-serif;
"
>

<div
style="
max-width:600px;
margin:40px auto;
background:#081329;
padding:40px;
color:white;
border-radius:12px;
"
>

<h1>
Kitchen<span
style="color:#d9ad45;"
>
Flow
</span>
</h1>

<h2>
Password Reset
</h2>

<p
style="color:#a7bad4;"
>
You requested to reset your
KitchenFlow account password.
</p>

<p
style="color:#a7bad4;"
>
Your verification OTP is:
</p>

<div
style="
margin:25px 0;
padding:20px;
background:#060f20;
border:1px solid #1b385e;
border-radius:10px;
text-align:center;
"
>

<span
style="
color:#d9ad45;
font-size:32px;
font-weight:bold;
letter-spacing:8px;
"
>
${otp}
</span>

</div>

<p
style="color:#a7bad4;"
>
This OTP will expire in
<strong
style="color:#d9ad45;"
>
10 minutes
</strong>.
</p>

<p
style="
color:#7086a6;
font-size:13px;
"
>
If you did not request this password reset,
you can safely ignore this email.
</p>

</div>

</body>

</html>
        `,
      };


      const info =
        await transporter.sendMail(
          mailOptions
        );


      console.log(
        "OTP email sent successfully"
      );

      console.log(
        "Message ID:",
        info.messageId
      );


      return info;

    } catch (error) {

      console.error(
        "OTP email sending failed:"
      );

      console.error(
        error
      );

      throw error;

    }

  };