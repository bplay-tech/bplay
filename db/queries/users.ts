import { eq } from "drizzle-orm";
import { db } from "../client";
import { users, type User, type NewUser } from "../schema/users";
import { partnerTiers, type PartnerTier } from "../schema/partner-tiers";
import { affiliations } from "../schema/affiliations";

export type UserWithTier = User & { tier: PartnerTier };

const userWithTierSelect = {
  id: users.id,
  email: users.email,
  passwordHash: users.passwordHash,
  name: users.name,
  role: users.role,
  partnerTierId: users.partnerTierId,
  referralCode: users.referralCode,
  transferAddress: users.transferAddress,
  isActive: users.isActive,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
  tier: partnerTiers,
};

export const getUserById = async (id: string): Promise<User | null> => {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] ?? null;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] ?? null;
};

export const getUserByReferralCode = async (code: string): Promise<User | null> => {
  const result = await db.select().from(users).where(eq(users.referralCode, code)).limit(1);
  return result[0] ?? null;
};

export const createUser = async (data: NewUser): Promise<User> => {
  const result = await db.insert(users).values(data).returning();
  return result[0];
};

export const updateUser = async (id: string, data: Partial<NewUser>): Promise<User> => {
  const result = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return result[0];
};

export const updateTransferAddress = async (userId: string, address: string | null): Promise<void> => {
  await db
    .update(users)
    .set({ transferAddress: address, updatedAt: new Date() })
    .where(eq(users.id, userId));
};

export const getAllUsers = async (): Promise<UserWithTier[]> => {
  const result = await db
    .select(userWithTierSelect)
    .from(users)
    .innerJoin(partnerTiers, eq(users.partnerTierId, partnerTiers.id));

  return result.map((row) => ({ ...row, tier: row.tier }));
};

export const getUsersByAffiliator = async (affiliateId: string): Promise<UserWithTier[]> => {
  const result = await db
    .select(userWithTierSelect)
    .from(users)
    .innerJoin(affiliations, eq(affiliations.referredUserId, users.id))
    .innerJoin(partnerTiers, eq(users.partnerTierId, partnerTiers.id))
    .where(eq(affiliations.affiliateId, affiliateId));

  return result.map((row) => ({ ...row, tier: row.tier }));
};
