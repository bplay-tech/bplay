import { SignJWT, jwtVerify } from "jose";

export type ResetTokenPayload = { userId: string; email: string };

const secret = () => {
  const key = (process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "").trim();
  if (!key) throw new Error("AUTH_SECRET environment variable is not set");
  return new TextEncoder().encode(key);
};

export const signResetToken = async (userId: string, email: string): Promise<string> =>
  new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setExpirationTime("1h")
    .sign(secret());

export const verifyResetToken = async (token: string): Promise<ResetTokenPayload | null> => {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") return null;
    return { userId: payload.sub, email: payload.email };
  } catch {
    return null;
  }
};
