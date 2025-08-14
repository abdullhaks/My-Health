import { z } from "zod";

export const LoginReqSchema = z.object({
  email: z.email(),
  password: z.string().min(6)
});
export type LoginReqDTO = z.infer<typeof LoginReqSchema>;

export const SignupReqSchema = z.object({
  fullName: z.string().min(2),
  email: z.email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6)
}).refine(d => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });
export type SignupReqDTO = z.infer<typeof SignupReqSchema>;

export const VerifyOtpReqSchema = z.object({
  email: z.email(),
  otp: z.string().min(4).max(8)
});
export type VerifyOtpReqDTO = z.infer<typeof VerifyOtpReqSchema>;

export const ResendOtpReqSchema = z.object({
  email: z.email()
});
export type ResendOtpReqDTO = z.infer<typeof ResendOtpReqSchema>;

export const ForgotPasswordReqSchema = z.object({
  email: z.email()
});
export type ForgotPasswordReqDTO = z.infer<typeof ForgotPasswordReqSchema>;

export const VerifyRecoveryReqSchema = z.object({
  email: z.email(),
  recoveryCode: z.string().min(4).max(12)
});
export type VerifyRecoveryReqDTO = z.infer<typeof VerifyRecoveryReqSchema>;

export const ResetPasswordReqSchema = z.object({
  newPassword: z.string().min(6),
  confirmPassword: z.string().min(6)
}).refine(d => d.newPassword === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });
export type ResetPasswordReqDTO = z.infer<typeof ResetPasswordReqSchema>;
