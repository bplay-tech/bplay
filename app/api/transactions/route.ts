import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import {
  getPaginatedTransactionsByUser,
  getPaginatedAllTransactions,
  type TransactionFilters,
} from "@/db/queries/transactions";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.error === "RefreshFailed") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const filters: TransactionFilters = {
      from: searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined,
      to: searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined,
      type: (searchParams.get("type") as TransactionFilters["type"]) ?? undefined,
      status: (searchParams.get("status") as TransactionFilters["status"]) ?? undefined,
    };
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20")));

    const { role, id: userId } = session.user;

    const result =
      role === "SUPER_ADMIN"
        ? await getPaginatedAllTransactions(filters, page, pageSize)
        : await getPaginatedTransactionsByUser(userId, filters, page, pageSize);

    return Response.json(result);
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
