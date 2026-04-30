"use client";

import { useActionState, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { sendBroadcastMessageAction } from "@/features/broadcast/actions";

const MAX_BODY = 5000;

export function ComposeClient() {
  const [state, action, pending] = useActionState(sendBroadcastMessageAction, null);
  const [bodyLen, setBodyLen] = useState(0);

  return (
    <Card>
      <form action={action} className="flex flex-col gap-5">
        <Input name="title" label="Title" placeholder="Announcement title…" maxLength={200} required />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">Message</label>
          <textarea
            name="body"
            rows={12}
            maxLength={MAX_BODY}
            required
            onChange={(e) => setBodyLen(e.target.value.length)}
            placeholder="Write your announcement here…"
            className="w-full rounded-xl px-4 py-3 text-sm bg-card border border-card-border text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
          <p className="text-xs text-muted text-right">
            {bodyLen} / {MAX_BODY} characters
          </p>
        </div>

        {state && "error" in state && (
          <p className="text-sm text-danger">{state.error}</p>
        )}
        {state && "success" in state && (
          <p className="text-sm text-success">Announcement sent to all users.</p>
        )}

        <Button type="submit" loading={pending} className="self-start">
          Send to All Users
        </Button>
      </form>
    </Card>
  );
}
