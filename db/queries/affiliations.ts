import { eq, count } from "drizzle-orm";
import { db } from "../client";
import { affiliations, type Affiliation, type NewAffiliation } from "../schema";

export const createAffiliation = async (data: NewAffiliation): Promise<Affiliation> => {
  const result = await db.insert(affiliations).values(data).returning();
  return result[0];
};

export const getAffiliationByReferredUser = async (referredUserId: string): Promise<Affiliation | null> => {
  const result = await db
    .select()
    .from(affiliations)
    .where(eq(affiliations.referredUserId, referredUserId))
    .limit(1);
  return result[0] ?? null;
};

export const getAffiliationsByAffiliate = async (affiliateId: string): Promise<Affiliation[]> => {
  return db.select().from(affiliations).where(eq(affiliations.affiliateId, affiliateId));
};

export const countReferrals = async (affiliateId: string): Promise<number> => {
  const result = await db
    .select({ total: count() })
    .from(affiliations)
    .where(eq(affiliations.affiliateId, affiliateId));
  return result[0]?.total ?? 0;
};
