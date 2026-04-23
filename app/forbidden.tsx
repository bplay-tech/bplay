"use client";

import { useRouter } from "next/navigation";

export default function Forbidden() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-lg font-medium">You don&apos;t have permission to access this page.</p>
      <button
        onClick={() => router.back()}
        className="px-4 py-2 bg-primary text-white rounded-md text-sm"
      >
        Go Back
      </button>
    </div>
  );
}
