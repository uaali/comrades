const SibApiV3Sdk = require("sib-api-v3-typescript");

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

let apiKey = apiInstance.authentications["apiKey"];
apiKey.apiKey = process.env.BREVO_SECRET_API_KEY;

let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

export async function sendOTP({
  email,
  otp,
  phone,
  amount,
  displayName,
}: {
  email: string;
  otp: string;
  phone: string;
  amount: number;
  displayName: string;
}) {
  sendSmtpEmail.subject = "Verify Your Withdrawal OTP";

  sendSmtpEmail.htmlContent = `
<html>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9;">
      <h2 style="color: #007bff; text-align: center;">Withdrawal OTP Verification</h2>
      <p>Dear {{params.displayName}},</p>
      <p>You recently requested to withdraw funds (Ksh. {{params.amount}}) from your account to the following phone number: {{params.phone}}.</p> 
      <p>To proceed, please use the following OTP (One-Time Password):</p>
      <div style="text-align: center; margin: 20px 0;">
        <span style="font-size: 24px; font-weight: bold; color: #007bff;">{{params.otp}}</span>
      </div>
      <p>This OTP is valid for 10 minutes. If you did not request this withdrawal, please contact our support team immediately.</p>
      <p>Thank you for using our services!</p>
      <hr>
      <p style="font-size: 12px; color: #999;">Thank you for using our services.</p>
    </div>
  </body>
</html>
`;

  sendSmtpEmail.sender = {
    name: "Tirigist",
    email: "kuriamuchuni@gmail.com",
  };

  sendSmtpEmail.to = [
    { email: email, name: displayName },
  ];

  sendSmtpEmail.replyTo = {
    email: "tirigist@gmail.com",
    name: "Support Team",
  };

  sendSmtpEmail.headers = {
    "X-Custom-Header": "unique-id-transaction-otp",
  };

  sendSmtpEmail.params = {
    displayName,
    otp,
    amount,
    phone,
  };

  await apiInstance.sendTransacEmail(sendSmtpEmail)
}
