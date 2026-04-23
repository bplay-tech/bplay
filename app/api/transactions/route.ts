import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import {
  getTransactionsByUser,
  getTeamTransactions,
  getAllTransactions,
  type TransactionFilters,
} from "@/db/queries/transactions";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const filters: TransactionFilters = {
    from: searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined,
    to: searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined,
    type: (searchParams.get("type") as TransactionFilters["type"]) ?? undefined,
    status: (searchParams.get("status") as TransactionFilters["status"]) ?? undefined,
  };

  const { role, id: userId } = session.user;

  const transactions =
    role === "SUPER_ADMIN"
      ? await getAllTransactions(filters)
      : role === "ADMIN"
      ? await getTeamTransactions(userId, filters)
      : await getTransactionsByUser(userId, filters);

  return Response.json(transactions);
}
