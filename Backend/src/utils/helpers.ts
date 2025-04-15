export default function generateOtp(): string {
    console.log("Generating OTP...");
    
     const otp = Math.floor(100000 + Math.random() * 900000).toString();
     return otp;
 }

 export function generateRandomPassword(length: number): string {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
}