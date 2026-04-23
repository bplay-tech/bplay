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
  const usdcContractAddress = (formData.get("usdcContractAddress") as string)?.trim();
  const treasuryAddress = (formData.get("treasuryAddress") as string)?.trim();

  if (isNaN(rate) || rate <= 0) return { error: "Rate must be a positive number." };
  if (!usdcContractAddress) return { error: "USDC contract address is required." };
  if (!treasuryAddress) return { error: "Treasury address is required." };

  await insertExchangeRate({
    rate: String(rate),
    usdcContractAddress,
    treasuryAddress,
    updatedBy: user.id,
  });

  revalidatePath("/dashboard/exchange-rate");
  revalidatePath("/dashboard/buy");
  return { success: true };
}
