"use client";

import { useActionState, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { updatePayoutSettingsAction } from "@/features/settings/actions";
import type { UserSettings } from "@/db/schema/user-settings";

const METHOD_OPTIONS = [
  { value: "USDC", label: "USDC" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
];

export function PayoutSettingsForm({ settings }: { settings: UserSettings | null }) {
  const [state, action, pending] = useActionState(updatePayoutSettingsAction, null);
  const [method, setMethod] = useState<"USDC" | "BANK_TRANSFER">(settings?.preferredPayoutMethod ?? "USDC");

  return (
    <Card>
      <h2 className="text-lg font-semibold text-foreground mb-4">Payout Settings</h2>
      <form action={action} className="flex flex-col gap-4 max-w-sm">
        <Select label="Preferred Payout Method" value={method} onValueChange={(v) => setMethod(v as "USDC" | "BANK_TRANSFER")} options={METHOD_OPTIONS} />
        <input type="hidden" name="preferredPayoutMethod" value={method} />
        {method === "USDC" && (
          <Input name="walletAddress" label="Wallet Address" placeholder="0x..." defaultValue={settings?.walletAddress ?? ""} />
        )}
        {state && "error" in state && <p className="text-sm text-danger">{state.error}</p>}
        {state && "success" in state && <p className="text-sm text-success">Settings saved.</p>}
        <Button type="submit" loading={pending} size="sm" className="self-start">Save Settings</Button>
      </form>
    </Card>
  );
}
