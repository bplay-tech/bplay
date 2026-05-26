"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { deleteAnnouncementAction } from "@/features/broadcast/actions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function DeleteAnnouncementButton({
  id,
  redirectAfter = false,
}: {
  id: string;
  redirectAfter?: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirming(true);
  };

  const handleConfirm = () => {
    setDeleting(true);
    startTransition(async () => {
      await deleteAnnouncementAction(id);
      setConfirming(false);
      if (redirectAfter) router.push("/dashboard/news");
    });
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={deleting}
        className="shrink-0 h-8 w-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-40"
        style={{ color: "rgba(248,113,113,0.6)" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)";
          (e.currentTarget as HTMLElement).style.color = "#f87171";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "transparent";
          (e.currentTarget as HTMLElement).style.color = "rgba(248,113,113,0.6)";
        }}
        title="Delete announcement"
      >
        {deleting
          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
          : <Trash2 className="h-3.5 w-3.5" />
        }
      </button>

      <ConfirmDialog
        open={confirming}
        title="Delete Announcement"
        description="Are you sure you want to delete this announcement? It will be removed for all users and cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleConfirm}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
