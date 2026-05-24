"use client";

import { useActionState, useState, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { sendBroadcastMessageAction } from "@/features/broadcast/actions";
import { Paperclip, X, Loader2 } from "lucide-react";

const MAX_BODY = 5000;

const TARGET_GROUPS = [
  { value: "ALL",   label: "Everyone",  description: "All admins, sales and users" },
  { value: "ADMIN", label: "All Admins", description: "Admin accounts only" },
  { value: "SALES", label: "All Sales",  description: "Sales accounts only" },
  { value: "USER",  label: "All Users",  description: "Regular buyer accounts" },
] as const;

export function ComposeClient() {
  const [state, action, pending] = useActionState(sendBroadcastMessageAction, null);
  const [bodyLen, setBodyLen] = useState(0);
  const [targetGroup, setTargetGroup] = useState<"ALL" | "ADMIN" | "SALES" | "USER">("ALL");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setUploadError("Only PDF files are supported.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File must be under 10 MB.");
      return;
    }
    setUploadError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? "Upload failed. Please try again.");
      }
      const { url } = await res.json() as { url: string };
      setAttachmentUrl(url);
      setAttachmentName(file.name);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const clearAttachment = () => {
    setAttachmentUrl("");
    setAttachmentName("");
    setUploadError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <Card>
      <form action={action} className="flex flex-col gap-5">
        <Input name="title" label="Title" placeholder="Announcement title…" maxLength={200} required />

        {/* Target group */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Send to</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TARGET_GROUPS.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => setTargetGroup(g.value)}
                className="flex flex-col items-start px-3 py-2.5 rounded-xl text-left transition-all"
                style={
                  targetGroup === g.value
                    ? { background: "rgba(124,92,255,0.2)", border: "1px solid rgba(124,92,255,0.5)" }
                    : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }
                }
              >
                <span className="text-xs font-semibold text-white">{g.label}</span>
                <span className="text-[10px] text-white/40 mt-0.5">{g.description}</span>
              </button>
            ))}
          </div>
          <input type="hidden" name="targetGroup" value={targetGroup} />
        </div>

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

        {/* PDF attachment */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Attachment (PDF, optional)</label>
          {attachmentUrl ? (
            <div
              className="flex items-center justify-between px-4 py-2.5 rounded-xl"
              style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)" }}
            >
              <span className="text-sm text-blue-300 flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                {attachmentName}
              </span>
              <button type="button" onClick={clearAttachment} className="text-white/40 hover:text-white/70">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div>
              <label
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                {uploading ? (
                  <><Loader2 className="h-4 w-4 animate-spin text-white/50" /> Uploading…</>
                ) : (
                  <><Paperclip className="h-4 w-4 text-white/50" /> <span className="text-white/60">Attach PDF</span></>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFile}
                  disabled={uploading}
                />
              </label>
              {uploadError && <p className="text-xs text-danger mt-1">{uploadError}</p>}
            </div>
          )}
          <input type="hidden" name="attachmentUrl" value={attachmentUrl} />
          <input type="hidden" name="attachmentName" value={attachmentName} />
        </div>

        {state && "error" in state && (
          <p className="text-sm text-danger">{state.error}</p>
        )}
        {state && "success" in state && (
          <p className="text-sm text-success">Announcement saved. Emails are being sent.</p>
        )}

        <Button type="submit" loading={pending} disabled={uploading} className="self-start">
          Send to {TARGET_GROUPS.find((g) => g.value === targetGroup)?.label ?? "Everyone"}
        </Button>
      </form>
    </Card>
  );
}
