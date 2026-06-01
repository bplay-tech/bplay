import { z } from "zod";

export const emailSchema = z
  .string()
  .min(1, "Email is required.")
  .email("Invalid email address.")
  .transform((v) => v.trim().toLowerCase());

export const walletAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address");

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

const requiredString = (field: string) => z.string().trim().min(1, `${field} is required.`);

export const dateOfBirthSchema = z
  .string()
  .trim()
  .min(1, "Date of birth is required.")
  .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date of birth.")
  .refine((v) => {
    const dob = new Date(v);
    const cutoff = new Date();
    cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 18);
    return dob <= cutoff;
  }, "You must be at least 18 years old.");

export const profileSchema = z.object({
  firstName: requiredString("First name"),
  lastName: requiredString("Last name"),
  phone: requiredString("Phone number").regex(/^[+]?[0-9 ()-]{6,20}$/, "Invalid phone number."),
  dateOfBirth: dateOfBirthSchema,
  country: requiredString("Country"),
  address: requiredString("Address"),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const registrationSchema = profileSchema.extend({
  email: emailSchema,
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
