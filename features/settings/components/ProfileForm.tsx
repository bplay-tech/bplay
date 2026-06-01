"use client";

import { useActionState, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CountryPhoneFields } from "@/components/ui/CountryPhoneFields";
import { DatePicker } from "@/components/ui/DatePicker";
import { updateProfileAction } from "@/features/settings/actions";

interface ProfileFormProps {
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  country: string | null;
  address: string | null;
}

export function ProfileForm({
  email,
  firstName,
  lastName,
  phone,
  dateOfBirth,
  country,
  address,
}: ProfileFormProps) {
  const [state, action, pending] = useActionState(updateProfileAction, null);
  const [countryValue, setCountryValue] = useState(country ?? "");
  return (
    <Card>
      <h2 className="text-lg font-semibold text-foreground mb-4">Profile</h2>
      <form action={action} className="flex flex-col gap-4 max-w-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input name="firstName" label="First Name" defaultValue={firstName ?? ""} required />
          <Input name="lastName" label="Last Name" defaultValue={lastName ?? ""} required />
        </div>
        <Input name="email" label="Email" value={email} readOnly className="opacity-60 cursor-not-allowed" />
        <CountryPhoneFields country={countryValue} onCountryChange={setCountryValue} defaultPhone={phone} />
        <DatePicker name="dateOfBirth" label="Date of Birth" defaultValue={dateOfBirth} required />
        <Input name="address" label="Address" defaultValue={address ?? ""} required />
        {state && "error" in state && <p className="text-sm text-danger">{state.error}</p>}
        {state && "success" in state && <p className="text-sm text-success">Profile updated.</p>}
        <Button type="submit" loading={pending} size="sm" className="self-start">
          Save Changes
        </Button>
      </form>
    </Card>
  );
}
