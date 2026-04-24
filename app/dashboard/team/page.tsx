import { verifyRole } from "@/lib/dal";
import { getAllUsers, getUsersByAffiliator, getUserById } from "@/db/queries/users";
import { getExchangeRate } from "@/lib/exchange";
import { TeamClient } from "./TeamClient";

export default async function TeamPage() {
  const user = await verifyRole(["ADMIN", "SUPER_ADMIN"]);

  const [members, rate, fullUser] = await Promise.all([
    user.role === "SUPER_ADMIN" ? getAllUsers() : getUsersByAffiliator(user.id),
    getExchangeRate(),
    getUserById(user.id),
  ]);

  const treasuryAddress = process.env.NEXT_PUBLIC_TREASURY_USDC_ADDRESS ?? "";
  const usdcContractAddress = process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS ?? "";
  const recipientAddress = fullUser?.transferAddress ?? treasuryAddress;
  const rateNum = parseFloat(rate.rate);

  return (
    <div className="flex flex-col gap-6">
      <TeamClient
        members={members}
        isSuperAdmin={user.role === "SUPER_ADMIN"}
        rate={rateNum}
        recipientAddress={recipientAddress}
        usdcContractAddress={usdcContractAddress}
      />
    </div>
  );
}
