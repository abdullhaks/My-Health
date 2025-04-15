export const generateRecoveryPasswordMail = (
    email: string,
    recoveryPassword: string
  ) => {
    const currentDate = new Date().toLocaleDateString();
  
    return {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Recovery Password",
      text: `Your recovery password is ${recoveryPassword}. It is valid for 24 hours. Please use it to reset your password. If you did not request this, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
          <div style="text-align: center;">
            <h1 style="color: #2196F3;">MyHealth</h1>
          </div>
          <h2 style="color: #333; text-align: center;">Recovery Password</h2>
          <p style="font-size: 16px; color: #555; text-align: center;">
            Your recovery password is:
          </p>
          <p style="font-size: 24px; color: #4CAF50; text-align: center;">
            <strong>${recoveryPassword}</strong>
          </p>
          <p style="font-size: 14px; color: #555; text-align: center;">
            This recovery password is valid for <strong style="color: #FF5722;">24 hours</strong>.
          </p>
          <p style="font-size: 14px; color: #888; text-align: center;">
            Date: <strong>${currentDate}</strong>
          </p>
          <p style="font-size: 14px; color: #888; text-align: center;">
            Please do not share this with anyone.
          </p>
          <footer style="margin-top: 20px; text-align: center; font-size: 12px; color: #aaa;">
            &copy; ${new Date().getFullYear()} MyHealth. All rights reserved.
          </footer>
        </div>
      `,
    };
  };
  