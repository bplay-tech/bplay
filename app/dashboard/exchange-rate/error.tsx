"use client";

import { Button } from "@/components/ui/Button";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <p className="text-danger font-medium">{error.message || "Something went wrong."}</p>
      <Button variant="outline" onClick={reset}>Try again</Button>
    </div>
  );
}
