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
