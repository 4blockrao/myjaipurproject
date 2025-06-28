
import { z } from "zod";

// Phone number validation - exactly 10 digits
export const phoneSchema = z
  .string()
  .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
  .refine((val) => val.length === 10, "Phone number must be exactly 10 digits");

// Email validation with standard RFC compliance
export const emailSchema = z
  .string()
  .email("Please enter a valid email address")
  .min(1, "Email is required");

// Name validation
export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must be less than 50 characters")
  .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces");

// Combined user info schema
export const userInfoSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
});

// Validation utilities
export const validatePhone = (phone: string): boolean => {
  return phoneSchema.safeParse(phone).success;
};

export const validateEmail = (email: string): boolean => {
  return emailSchema.safeParse(email).success;
};

export const validateName = (name: string): boolean => {
  return nameSchema.safeParse(name).success;
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Take only the first 10 digits
  return digits.slice(0, 10);
};

export const getValidationError = (field: string, value: string): string | null => {
  try {
    switch (field) {
      case 'phone':
        phoneSchema.parse(value);
        break;
      case 'email':
        emailSchema.parse(value);
        break;
      case 'name':
        nameSchema.parse(value);
        break;
      default:
        return null;
    }
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0].message;
    }
    return "Invalid input";
  }
};
