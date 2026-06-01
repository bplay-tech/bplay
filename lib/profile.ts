import type { User } from "@/db/schema/users";

export const REQUIRED_PROFILE_FIELDS = [
  "firstName",
  "lastName",
  "phone",
  "dateOfBirth",
  "country",
  "address",
] as const;

type ProfileFields = Pick<User, (typeof REQUIRED_PROFILE_FIELDS)[number]>;

export const isProfileComplete = (user: ProfileFields): boolean =>
  REQUIRED_PROFILE_FIELDS.every((field) => {
    const value = user[field];
    return typeof value === "string" && value.trim().length > 0;
  });
