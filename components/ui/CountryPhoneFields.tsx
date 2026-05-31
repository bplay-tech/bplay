"use client";

import { useState } from "react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { COUNTRIES, dialCodeForCountry } from "@/lib/countries";

interface CountryPhoneFieldsProps {
  country: string;
  onCountryChange: (value: string) => void;
  defaultPhone?: string | null;
}

const fieldClass =
  "h-10 w-full rounded-lg border border-card-border bg-card px-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";

export function CountryPhoneFields({ country, onCountryChange, defaultPhone }: CountryPhoneFieldsProps) {
  const [phone, setPhone] = useState(
    defaultPhone?.trim() || dialCodeForCountry(country) || ""
  );

  const handleCountryChange = (value: string) => {
    onCountryChange(value);
    const dial = dialCodeForCountry(value);
    if (!dial) return;
    setPhone((prev) => {
      const national = prev.replace(/^\+\d+/, "").replace(/\D/g, "");
      return national ? `${dial}${national}` : dial;
    });
  };

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="country" className="text-sm font-medium text-foreground">
          Country
        </label>
        <select
          id="country"
          name="country"
          value={country}
          onChange={(event) => handleCountryChange(event.target.value)}
          required
          autoComplete="country-name"
          className={fieldClass}
        >
          <option value="" disabled>
            Select your country
          </option>
          {COUNTRIES.map((item) => (
            <option key={item.name} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Phone Number</label>
        <PhoneInput
          defaultCountry="us"
          value={phone}
          onChange={(value) => setPhone(value)}
          inputProps={{ "aria-label": "Phone number" }}
        />
        <input type="hidden" name="phone" value={phone} />
      </div>
    </>
  );
}
