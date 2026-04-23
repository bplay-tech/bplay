import { getUserByReferralCode } from "@/db/queries/users";

export const generateReferralCode = (name: string): string => {
  const base = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4)
    .padEnd(4, "X");
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}${suffix}`;
};

export const generateUniqueReferralCode = async (name: string): Promise<string> => {
  let code = generateReferralCode(name);
  let attempts = 0;
  while (attempts < 10) {
    const existing = await getUserByReferralCode(code);
    if (!existing) return code;
    code = generateReferralCode(name);
    attempts++;
  }
  return `REF${Date.now().toString(36).toUpperCase()}`;
};

export const buildReferralUrl = (referralCode: string, baseUrl: string): string => {
  return `${baseUrl}/register?ref=${referralCode}`;
};
