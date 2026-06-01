"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { sendDirectMessageAction } from "@/features/messaging/actions";
import { Paperclip, X, Loader2, Search, ChevronLeft, ChevronRight, User, Users } from "lucide-react";

interface Recipient {
  id: string;
  name: string;
  email: string;
  role: string;
}

const ROLE_LABEL: Record<string, { label: string; color: string }> = {
  SUPER_ADMIN: { label: "Super Admin", color: "text-red-400" },
  ADMIN:       { label: "Admin",       color: "text-amber-400" },
  SALES:       { label: "Sales",       color: "text-blue-400" },
  USER:        { label: "User",        color: "text-white/40" },
};

interface Props {
  recipients: Recipient[];
}

type TargetType = "INDIVIDUAL" | "GROUP";
type TargetGroup = "ADMIN" | "SALES" | "USER";

const TARGET_GROUPS: { value: TargetGroup; label: string; description: string }[] = [
  { value: "ADMIN", label: "All Admins", description: "Admin accounts only" },
  { value: "SALES", label: "All Sales",  description: "Sales accounts only" },
  { value: "USER",  label: "All Users",  description: "Regular buyer accounts" },
];

const MAX_BODY = 5000;
const PAGE_SIZE = 8;

function RecipientPicker({
  recipients,
  selected,
  onSelect,
}: {
  recipients: Recipient[];
  selected: Recipient | null;
  onSelect: (r: Recipient | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = recipients.filter(
    (r) =>
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.email.toLowerCase().includes(query.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const slice = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (r: Recipient) => {
    onSelect(r);
    setOpen(false);
    setQuery("");
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-1" ref={containerRef}>
      <label className="text-sm font-medium text-foreground">To</label>

      {selected ? (
        <div
          className="flex items-center justify-between px-4 py-3 rounded-xl"
          style={{ background: "rgba(124,92,255,0.1)", border: "1px solid rgba(124,92,255,0.4)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(124,92,255,0.2)" }}>
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">{selected.name}</p>
                <span className={`text-[10px] font-semibold ${(ROLE_LABEL[selected.role] ?? { color: "text-white/40" }).color}`}>
                  {(ROLE_LABEL[selected.role] ?? { label: selected.role }).label}
                </span>
              </div>
              <p className="text-xs text-muted">{selected.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="text-white/40 hover:text-white/70 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full text-left rounded-xl px-4 py-3 text-sm bg-card border border-card-border text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors hover:border-white/20"
        >
          Click to select recipient…
        </button>
      )}

      {open && (
        <div
          className="flex flex-col gap-2 rounded-xl p-3 mt-1"
          style={{ background: "rgba(20,20,35,0.98)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
        >
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>

          {/* Count */}
          <p className="text-xs text-white/30 px-1">
            {filtered.length} recipient{filtered.length !== 1 ? "s" : ""}
            {query && ` matching "${query}"`}
          </p>

          {/* List */}
          <div className="flex flex-col gap-0.5">
            {slice.length === 0 ? (
              <p className="text-sm text-white/40 text-center py-4">No recipients found.</p>
            ) : (
              slice.map((r) => {
                const roleInfo = ROLE_LABEL[r.role] ?? { label: r.role, color: "text-white/40" };
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleSelect(r)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors hover:bg-white/5"
                  >
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(124,92,255,0.15)" }}>
                      <span className="text-xs font-semibold text-primary/80">
                        {r.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
                      <p className="text-xs text-white/40 truncate">{r.email}</p>
                    </div>
                    <span className={`text-[10px] font-semibold shrink-0 ${roleInfo.color}`}>
                      {roleInfo.label}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-1 border-t border-white/8">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-1.5 rounded-lg text-white/40 hover:text-white/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-white/40">
                {safePage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="p-1.5 rounded-lg text-white/40 hover:text-white/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ComposeMessageClient({ recipients }: Props) {
  const [state, action, pending] = useActionState(sendDirectMessageAction, null);
  const [bodyLen, setBodyLen] = useState(0);
  const [targetType, setTargetType] = useState<TargetType>("INDIVIDUAL");
  const [targetGroup, setTargetGroup] = useState<TargetGroup>("ADMIN");
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
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
        {/* Send-to mode tabs */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Send to</label>
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: "INDIVIDUAL" as TargetType, label: "Individual", Icon: User },
              { value: "GROUP" as TargetType, label: "Group", Icon: Users },
            ]).map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTargetType(value)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all"
                style={
                  targetType === value
                    ? { background: "rgba(124,92,255,0.2)", border: "1px solid rgba(124,92,255,0.5)" }
                    : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }
                }
              >
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-white">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {targetType === "INDIVIDUAL" ? (
          <RecipientPicker
            recipients={recipients}
            selected={selectedRecipient}
            onSelect={setSelectedRecipient}
          />
        ) : (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Target group</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
          </div>
        )}

        <input type="hidden" name="targetType" value={targetType} />
        <input type="hidden" name="toUserId" value={targetType === "INDIVIDUAL" ? selectedRecipient?.id ?? "" : ""} />
        <input type="hidden" name="targetGroup" value={targetType === "GROUP" ? targetGroup : ""} />

        <Input name="subject" label="Subject" placeholder="Message subject…" maxLength={200} required />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">Message</label>
          <textarea
            name="body"
            rows={10}
            maxLength={MAX_BODY}
            required
            onChange={(e) => setBodyLen(e.target.value.length)}
            placeholder="Write your message here…"
            className="w-full rounded-xl px-4 py-3 text-sm bg-card border border-card-border text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
          <p className="text-xs text-muted text-right">{bodyLen} / {MAX_BODY}</p>
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
          <p className="text-sm text-success">Message sent successfully.</p>
        )}

        <Button
          type="submit"
          loading={pending}
          disabled={uploading || (targetType === "INDIVIDUAL" && !selectedRecipient)}
          className="self-start"
        >
          {targetType === "INDIVIDUAL"
            ? "Send Message"
            : `Send to ${TARGET_GROUPS.find((g) => g.value === targetGroup)?.label ?? "Group"}`}
        </Button>
      </form>
    </Card>
  );
}
