import { SignJWT, jwtVerify } from "jose";

const secret = () => {
  const key = process.env.AUTH_SECRET;
  if (!key) throw new Error("AUTH_SECRET environment variable is not set");
  return new TextEncoder().encode(key);
};

export type InviteTokenPayload = { userId: string; name: string };

export const signInviteToken = async (userId: string, name: string): Promise<string> =>
  new SignJWT({ name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setExpirationTime("72h")
    .sign(secret());

export const verifyInviteToken = async (token: string): Promise<InviteTokenPayload | null> => {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.sub !== "string" || typeof payload.name !== "string") return null;
    return { userId: payload.sub, name: payload.name };
  } catch {
    return null;
  }
};
