import { eq, or, sql } from "drizzle-orm";
import { db } from "../client";
import { users, type User, type NewUser } from "../schema/users";
import { partnerTiers, type PartnerTier } from "../schema/partner-tiers";
import { affiliations } from "../schema/affiliations";
import { userSettings } from "../schema/user-settings";
import { userNotifications } from "../schema/user-notifications";
import { invitationTokens } from "../schema/invitation-tokens";
import { transactions } from "../schema/transactions";
import { payoutRequests } from "../schema/payout-requests";
import { bplayPurchases } from "../schema/bplay-purchases";
import { exchangeRates } from "../schema/exchange-rates";
import { messageReads } from "../schema/message-reads";
import { deleteDirectMessagesByUser } from "./direct-messages";

export type UserWithTier = User & { tier: PartnerTier };
export type UserWithTierAndWallet = UserWithTier & { walletAddress: string | null };
export type UserWithTierWalletAndManager = UserWithTierAndWallet & { managerName: string | null };

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

const userWithTierAndWalletSelect = {
  ...userWithTierSelect,
  walletAddress: userSettings.walletAddress,
};

export const getUserById = async (id: string): Promise<User | null> => {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] ?? null;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const normalized = email.trim().toLowerCase();
  const result = await db.select().from(users).where(sql`lower(${users.email}) = ${normalized}`).limit(1);
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

export const deleteUser = async (id: string): Promise<void> => {
  // Nullify nullable FKs in records owned by other users
  await db.update(exchangeRates).set({ updatedBy: null }).where(eq(exchangeRates.updatedBy, id));
  await db.update(bplayPurchases).set({ approvedBy: null }).where(eq(bplayPurchases.approvedBy, id));
  await db.update(payoutRequests).set({ reviewedBy: null }).where(eq(payoutRequests.reviewedBy, id));

  // Delete all records owned by this user
  await db.delete(messageReads).where(eq(messageReads.userId, id));
  await deleteDirectMessagesByUser(id);
  await db.delete(userSettings).where(eq(userSettings.userId, id));
  await db.delete(userNotifications).where(eq(userNotifications.userId, id));
  await db.delete(invitationTokens).where(eq(invitationTokens.userId, id));
  await db.delete(transactions).where(eq(transactions.userId, id));
  await db.delete(payoutRequests).where(eq(payoutRequests.userId, id));
  await db.delete(bplayPurchases).where(eq(bplayPurchases.userId, id));
  await db.delete(affiliations).where(or(eq(affiliations.affiliateId, id), eq(affiliations.referredUserId, id)));

  await db.delete(users).where(eq(users.id, id));
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

export const getActiveUserRecipients = async (): Promise<{ id: string; email: string; name: string }[]> => {
  return db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(users)
    .where(eq(users.isActive, true));
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

const managerNameCol = sql<string | null>`(
  SELECT u2.name
  FROM affiliations a
  INNER JOIN users u2 ON a.affiliate_id = u2.id
  WHERE a.referred_user_id = users.id
  LIMIT 1
)`;

export const getAllUsersWithWallet = async (): Promise<UserWithTierWalletAndManager[]> => {
  const result = await db
    .select({ ...userWithTierAndWalletSelect, managerName: managerNameCol })
    .from(users)
    .innerJoin(partnerTiers, eq(users.partnerTierId, partnerTiers.id))
    .leftJoin(userSettings, eq(userSettings.userId, users.id));

  return result.map((row) => ({
    ...row,
    tier: row.tier,
    walletAddress: row.walletAddress ?? null,
    managerName: row.managerName ?? null,
  }));
};

export const getSuperAdmin = async (): Promise<User | null> => {
  const result = await db.select().from(users).where(eq(users.role, "SUPER_ADMIN")).limit(1);
  return result[0] ?? null;
};

export const getUsersByAffiliatorWithWallet = async (affiliateId: string): Promise<UserWithTierWalletAndManager[]> => {
  const result = await db
    .select(userWithTierAndWalletSelect)
    .from(users)
    .innerJoin(affiliations, eq(affiliations.referredUserId, users.id))
    .innerJoin(partnerTiers, eq(users.partnerTierId, partnerTiers.id))
    .leftJoin(userSettings, eq(userSettings.userId, users.id))
    .where(eq(affiliations.affiliateId, affiliateId));

  return result.map((row) => ({ ...row, tier: row.tier, walletAddress: row.walletAddress ?? null, managerName: null }));
};
