"use server";

import { revalidatePath } from "next/cache";
import { verifyRole } from "@/lib/dal";
import { insertExchangeRate } from "@/db/queries/exchange-rates";

export async function updateExchangeRateAction(
  _prev: { error: string } | { success: true } | null,
  formData: FormData
): Promise<{ error: string } | { success: true }> {
  const user = await verifyRole(["SUPER_ADMIN"]);
  const rate = parseFloat(formData.get("rate") as string);

  if (isNaN(rate) || rate <= 0) return { error: "Rate must be a positive number." };

  await insertExchangeRate({ rate: String(rate), updatedBy: user.id });

  revalidatePath("/dashboard/exchange-rate");
  revalidatePath("/dashboard/buy");
  return { success: true };
}
