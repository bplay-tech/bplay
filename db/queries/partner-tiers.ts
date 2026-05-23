import { eq } from "drizzle-orm";
import { db } from "../client";
import { partnerTiers, type NewPartnerTier, type PartnerTier } from "../schema";

export const getAllPartnerTiers = async (): Promise<PartnerTier[]> => {
  return db.select().from(partnerTiers).orderBy(partnerTiers.minTurnoverUsd);
};

export const getPartnerTierById = async (id: string): Promise<PartnerTier | null> => {
  const result = await db.select().from(partnerTiers).where(eq(partnerTiers.id, id)).limit(1);
  return result[0] ?? null;
};

export const getPartnerTierByName = async (name: string): Promise<PartnerTier | null> => {
  const result = await db.select().from(partnerTiers).where(eq(partnerTiers.name, name)).limit(1);
  return result[0] ?? null;
};

export const createPartnerTier = async (data: NewPartnerTier): Promise<PartnerTier> => {
  const result = await db.insert(partnerTiers).values(data).returning();
  return result[0];
};

export const updatePartnerTier = async (id: string, data: Partial<NewPartnerTier>): Promise<PartnerTier> => {
  const result = await db.update(partnerTiers).set(data).where(eq(partnerTiers.id, id)).returning();
  return result[0];
};
