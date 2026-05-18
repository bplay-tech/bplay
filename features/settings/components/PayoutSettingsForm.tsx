"use client";

import { useActionState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updatePayoutSettingsAction } from "@/features/settings/actions";
import type { UserSettings } from "@/db/schema/user-settings";

export function PayoutSettingsForm({ settings }: { settings: UserSettings | null }) {
  const [state, action, pending] = useActionState(updatePayoutSettingsAction, null);

  return (
    <Card>
      <h2 className="text-lg font-semibold text-foreground mb-4">Payout Settings</h2>
      <form action={action} className="flex flex-col gap-4 max-w-sm">
        <input type="hidden" name="preferredPayoutMethod" value="USDC" />
        <Input
          name="walletAddress"
          label="USDC Wallet Address"
          placeholder="0x..."
          defaultValue={settings?.walletAddress ?? ""}
        />
        {state && "error" in state && <p className="text-sm text-danger">{state.error}</p>}
        {state && "success" in state && <p className="text-sm text-success">Settings saved.</p>}
        <Button type="submit" loading={pending} size="sm" className="self-start">Save Settings</Button>
      </form>
    </Card>
  );
}
