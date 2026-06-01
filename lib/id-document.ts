export const DOCUMENT_TYPES = [
  { value: "PASSPORT", label: "Passport" },
  { value: "NATIONAL_ID", label: "National ID (NIC)" },
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number]["value"];

// Generic format checks (fallback when there is no country-specific rule).
export const PASSPORT_REGEX = /^[A-Za-z0-9]{6,9}$/;
export const NATIONAL_ID_REGEX = /^[A-Za-z0-9-]{5,20}$/;

interface DocRule {
  regex: RegExp;
  hint: string;
}

// Best-effort, country-specific formats. Keyed by the exact country name used in lib/countries.ts.
const COUNTRY_RULES: Record<string, Partial<Record<DocumentType, DocRule>>> = {
  "United Kingdom": {
    PASSPORT: { regex: /^[0-9]{9}$/, hint: "9 digits" },
    NATIONAL_ID: {
      regex: /^[A-Za-z]{2}[0-9]{6}[A-Za-z]$/,
      hint: "National Insurance No., e.g. QQ123456C",
    },
  },
  "United States": {
    PASSPORT: { regex: /^[A-Za-z0-9]{9}$/, hint: "9 letters or digits" },
    NATIONAL_ID: { regex: /^[0-9]{3}-?[0-9]{2}-?[0-9]{4}$/, hint: "SSN, 9 digits e.g. 123-45-6789" },
  },
  Pakistan: {
    PASSPORT: { regex: /^[A-Za-z]{1,2}[0-9]{7}$/, hint: "1-2 letters + 7 digits" },
    NATIONAL_ID: {
      regex: /^[0-9]{5}-?[0-9]{7}-?[0-9]$/,
      hint: "CNIC, 13 digits e.g. 35202-1234567-1",
    },
  },
  Slovakia: {
    PASSPORT: { regex: /^[A-Za-z]{1,2}[0-9]{6,7}$/, hint: "1-2 letters + 6-7 digits" },
    NATIONAL_ID: { regex: /^[A-Za-z]{2}[0-9]{6}$/, hint: "ID card no., 2 letters + 6 digits" },
  },
};

export const isDocumentType = (value: string): value is DocumentType =>
  value === "PASSPORT" || value === "NATIONAL_ID";

export const documentTypeLabel = (value: string | null | undefined): string =>
  DOCUMENT_TYPES.find((type) => type.value === value)?.label ?? "";

// Returns a validation message, or null when the number is acceptable for the type + country.
export const idNumberError = (
  documentType: string,
  idNumber: string,
  country?: string | null
): string | null => {
  const value = idNumber.trim();
  if (!value) return "Identification number is required.";

  const rule = country && isDocumentType(documentType) ? COUNTRY_RULES[country]?.[documentType] : undefined;
  if (rule) {
    if (rule.regex.test(value)) return null;
    const label = documentType === "PASSPORT" ? "passport number" : "national ID number";
    return `Enter a valid ${country} ${label} (${rule.hint}).`;
  }

  if (documentType === "PASSPORT" && !PASSPORT_REGEX.test(value)) {
    return "Enter a valid passport number (6-9 letters or digits).";
  }
  if (documentType === "NATIONAL_ID" && !NATIONAL_ID_REGEX.test(value)) {
    return "Enter a valid national ID number (5-20 letters, digits or hyphens).";
  }
  return null;
};
