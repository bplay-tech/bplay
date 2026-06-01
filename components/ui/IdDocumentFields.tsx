"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { DOCUMENT_TYPES, idNumberError } from "@/lib/id-document";

interface IdDocumentFieldsProps {
  country?: string | null;
  defaultType?: string | null;
  defaultNumber?: string | null;
}

const selectClass =
  "h-10 w-full rounded-lg border border-card-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";

const labelFor = (type: string): string => {
  if (type === "PASSPORT") return "Passport Number";
  if (type === "NATIONAL_ID") return "National ID (NIC) Number";
  return "Identification Number";
};

const placeholderFor = (type: string): string => {
  if (type === "PASSPORT") return "e.g. N1234567";
  if (type === "NATIONAL_ID") return "e.g. 200012345678";
  return "Select a document type first";
};

export function IdDocumentFields({ country, defaultType, defaultNumber }: IdDocumentFieldsProps) {
  const [type, setType] = useState(defaultType ?? "");
  const [number, setNumber] = useState(defaultNumber ?? "");

  const error = type && number.trim() ? idNumberError(type, number, country) : null;

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="documentType" className="text-sm font-medium text-foreground">
          Document Type
        </label>
        <select
          id="documentType"
          name="documentType"
          value={type}
          onChange={(event) => setType(event.target.value)}
          required
          className={selectClass}
        >
          <option value="" disabled>
            Select document type
          </option>
          {DOCUMENT_TYPES.map((doc) => (
            <option key={doc.value} value={doc.value}>
              {doc.label}
            </option>
          ))}
        </select>
      </div>

      <Input
        name="idNumber"
        label={labelFor(type)}
        value={number}
        onChange={(event) => setNumber(event.target.value)}
        placeholder={placeholderFor(type)}
        error={error ?? undefined}
        required
      />
    </>
  );
}
