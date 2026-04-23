"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { updateNotificationsAction } from "@/features/settings/actions";
import type { UserNotifications } from "@/db/schema/user-notifications";

const NOTIFICATION_FIELDS = [
  { key: "newSale", label: "New Sale", description: "Get notified when a new sale is recorded" },
  { key: "weeklyReport", label: "Weekly Report", description: "Receive weekly performance summary" },
  { key: "payoutConfirm", label: "Payout Confirmed", description: "Get notified when a payout is approved" },
  { key: "teamActivity", label: "Team Activity", description: "Get notified about team member activity" },
] as const;

type FieldKey = (typeof NOTIFICATION_FIELDS)[number]["key"];

export function NotificationsForm({ notifications }: { notifications: UserNotifications | null }) {
  const [values, setValues] = useState<Record<FieldKey, boolean>>({
    newSale: notifications?.newSale ?? true,
    weeklyReport: notifications?.weeklyReport ?? true,
    payoutConfirm: notifications?.payoutConfirm ?? true,
    teamActivity: notifications?.teamActivity ?? false,
  });
  const [, startTransition] = useTransition();

  const handleToggle = (key: FieldKey, value: boolean) => {
    const next = { ...values, [key]: value };
    setValues(next);
    startTransition(async () => {
      const fd = new FormData();
      for (const [k, v] of Object.entries(next)) {
        fd.set(k, String(v));
      }
      await updateNotificationsAction(fd);
    });
  };

  return (
    <Card>
      <h2 className="text-lg font-semibold text-foreground mb-4">Notifications</h2>
      <div className="flex flex-col divide-y divide-card-border">
        {NOTIFICATION_FIELDS.map(({ key, label, description }) => (
          <div key={key} className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted mt-0.5">{description}</p>
            </div>
            <Toggle checked={values[key]} onCheckedChange={(v) => handleToggle(key, v)} />
          </div>
        ))}
      </div>
    </Card>
  );
}
