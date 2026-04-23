"use client";

import { useRouter } from "next/navigation";

export default function Unauthorized() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-lg font-medium">You must be logged in to access this page.</p>
      <button
        onClick={() => router.push("/login")}
        className="px-4 py-2 bg-primary text-white rounded-md text-sm"
      >
        Go to Login
      </button>
    </div>
  );
}
