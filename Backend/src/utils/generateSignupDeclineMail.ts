


export const generateDeclineMail = (email: string, reason: string) => {
  const currentDate = new Date().toLocaleDateString();
  
  return {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "MyHealth Doctor Account Application Status",
    text: `Dear Doctor,

We regret to inform you that your application to join MyHealth as a doctor has been declined. Reason: ${reason}.

Please review your application and ensure all credentials are valid and up-to-date. You are welcome to reapply with corrected information at http://localhost:5173/doctor/signup.

If you have any questions, please contact our support team at support@myhealth.com.

Best regards,
MyHealth Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
        <div style="text-align: center;">
          <img src="https://i.postimg.cc/zGFDwNVq/app-logo-blue.png" alt="MyHealth" style="width: 150px; height: auto; margin-bottom: 20px;" />
          <h1 style="color: #2196F3;">MyHealth</h1>
        </div>
        <h2 style="color: #333; text-align: center;">Doctor Account Application Status</h2>
        <p style="font-size: 16px; color: #555; text-align: center;">
          Dear Doctor,
        </p>
        <p style="font-size: 14px; color: #555; text-align: center;">
          We regret to inform you that your application to join MyHealth as a doctor has been declined due to the following reason:
        </p>
        <p style="font-size: 14px; color: #FF5722; text-align: center; font-weight: bold;">
          ${reason}
        </p>
        <p style="font-size: 14px; color: #555; text-align: center;">
          Please review your application and ensure all credentials are valid and up-to-date. You are welcome to reapply with corrected information at <a href="http://localhost:5173/doctor/signup" style="color: #2196F3; text-decoration: none;">http://localhost:5173/doctor/signup</a>.
        </p>
        <p style="font-size: 14px; color: #555; text-align: center;">
          If you have any questions, please contact our support team at <a href="mailto:support@myhealth.com" style="color: #2196F3; text-decoration: none;">support@myhealth.com</a>.
        </p>
        <p style="font-size: 14px; color: #888; text-align: center;">
          Date: <strong>${currentDate}</strong>
        </p>
        <footer style="margin-top: 20px; text-align: center; font-size: 12px; color: #aaa;">
          © ${new Date().getFullYear()} MyHealth All rights reserved.
        </footer>
      </div>
    `,
  };
};