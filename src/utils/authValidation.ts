import { z } from 'zod';

// Email validation schema
export const emailSchema = z
  .string()
  .trim()
  .min(1, { message: 'Email is required' })
  .email({ message: 'Please enter a valid email address' })
  .max(255, { message: 'Email must be less than 255 characters' });

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .max(72, { message: 'Password must be less than 72 characters' })
  .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  .regex(/[0-9]/, { message: 'Password must contain at least one number' });

// Simple password for login (don't validate complexity on login)
export const loginPasswordSchema = z
  .string()
  .min(1, { message: 'Password is required' })
  .max(72, { message: 'Password must be less than 72 characters' });

// Full name validation
export const fullNameSchema = z
  .string()
  .trim()
  .min(2, { message: 'Name must be at least 2 characters' })
  .max(100, { message: 'Name must be less than 100 characters' })
  .regex(/^[a-zA-Z\s]+$/, { message: 'Name can only contain letters and spaces' });

// Referral code validation (7 digit alphanumeric)
export const referralCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9]{6,8}$/, { message: 'Invalid referral code format' })
  .optional()
  .or(z.literal(''));

// Login form schema
export const loginFormSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
});

// Signup form schema
export const signupFormSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  password: passwordSchema,
  referralCode: referralCodeSchema,
});

// Types
export type LoginFormData = z.infer<typeof loginFormSchema>;
export type SignupFormData = z.infer<typeof signupFormSchema>;

// Validation helpers
export const validateLoginForm = (data: unknown) => {
  return loginFormSchema.safeParse(data);
};

export const validateSignupForm = (data: unknown) => {
  return signupFormSchema.safeParse(data);
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
