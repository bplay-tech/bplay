"use server";

import { revalidatePath } from "next/cache";
import { verifyRole } from "@/lib/dal";
import { insertExchangeRate } from "@/db/queries/exchange-rates";

export async function updateExchangeRateAction(
  _prev: { error: string } | { success: true } | null,
  formData: FormData
): Promise<{ error: string } | { success: true }> {
  const user = await verifyRole(["SUPER_ADMIN"]);
  const inputRate = parseFloat(formData.get("rate") as string);

  if (isNaN(inputRate) || inputRate <= 0) return { error: "Rate must be a positive number." };

  // Input is USDC per 1 BPLAY; DB stores BPLAY per 1 USDC
  const storedRate = 1 / inputRate;
  await insertExchangeRate({ rate: String(storedRate), updatedBy: user.id });

  revalidatePath("/dashboard/exchange-rate");
  revalidatePath("/dashboard/buy");
  revalidatePath("/dashboard/overview");
  revalidatePath("/dashboard", "layout");
  revalidatePath("/api/bplay-rate");
  return { success: true };
}
