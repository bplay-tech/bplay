"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { upsertSettings } from "@/db/queries/user-settings";
import { walletAddressSchema } from "@/lib/zod";
import { checksumAddress } from "@/lib/utils";

export async function saveWalletAddressAction(
  address: string
): Promise<{ error: string } | { success: true }> {
  const user = await verifySession();

  const parsed = walletAddressSchema.safeParse(address);
  if (!parsed.success) return { error: "Invalid Ethereum address." };

  const normalized = checksumAddress(parsed.data);
  await upsertSettings(user.id, { walletAddress: normalized });

  revalidatePath("/dashboard/settings");
  return { success: true };
}
