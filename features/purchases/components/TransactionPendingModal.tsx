"use client";

import { Download } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";

interface TransactionPendingModalProps {
  open: boolean;
  txHash?: string;
  confirmed: boolean;
  purchaseId?: string;
  onClose: () => void;
}

export function TransactionPendingModal({ open, txHash, confirmed, purchaseId, onClose }: TransactionPendingModalProps) {
  return (
    <Modal open={open} onOpenChange={(o) => { if (!o && confirmed) onClose(); }} title={confirmed ? "Transaction Confirmed" : "Transaction In Progress"}>
      <div className="flex flex-col items-center gap-4 py-4">
        {confirmed ? (
          <>
            <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center">
              <span className="text-success text-xl">✓</span>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Payment confirmed on-chain</p>
              <p className="text-xs text-muted mt-1">Your BPLAY tokens will be credited to your account shortly.</p>
            </div>
          </>
        ) : (
          <>
            <Spinner className="h-10 w-10 text-primary" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Processing your payment</p>
              <p className="text-xs text-danger mt-1 font-semibold">Do not close this page</p>
            </div>
          </>
        )}
        {txHash && (
          <a
            href={`https://etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline truncate max-w-full"
          >
            View on Etherscan →
          </a>
        )}
        {!confirmed && (
          <p className="text-xs text-muted text-center">
            Waiting for blockchain confirmation. This may take a minute.
          </p>
        )}
        {confirmed && purchaseId && (
          <a
            href={`/api/purchases/${purchaseId}/saft`}
            download
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-card-border bg-card text-sm font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <Download className="h-4 w-4" />
            Download SAFT
          </a>
        )}
        {confirmed && (
          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        )}
      </div>
    </Modal>
  );
}
