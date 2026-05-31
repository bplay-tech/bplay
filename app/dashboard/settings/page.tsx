import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { getUserById } from "@/db/queries/users";
import { getSettingsByUser } from "@/db/queries/user-settings";
import { getNotificationsByUser } from "@/db/queries/user-notifications";
import { getBplayPurchasesByUser } from "@/db/queries/bplay-purchases";
import { ProfileForm } from "@/features/settings/components/ProfileForm";
import { PayoutSettingsForm } from "@/features/settings/components/PayoutSettingsForm";
import { NotificationsForm } from "@/features/settings/components/NotificationsForm";
import { PurchaseDocuments } from "@/features/settings/components/PurchaseDocuments";
import { isProfileComplete } from "@/lib/profile";

export default async function SettingsPage() {
  const session = await verifySession();
  const isUser = session.role === "USER";
  const [user, settings, notifications, purchases] = await Promise.all([
    getUserById(session.id),
    getSettingsByUser(session.id),
    getNotificationsByUser(session.id),
    getBplayPurchasesByUser(session.id),
  ]);

  if (!user) redirect("/login"); // session token belongs to a deleted account

  const saftPurchases = purchases
    .filter((purchase) => purchase.status !== "failed")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="flex flex-col gap-6 w-full sm:max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted mt-1">Manage your profile and notifications</p>
      </div>
      <ProfileForm
        email={user.email}
        firstName={user.firstName}
        lastName={user.lastName}
        phone={user.phone}
        dateOfBirth={user.dateOfBirth}
        country={user.country}
        address={user.address}
        documentType={user.idDocumentType}
        idNumber={user.idNumber}
      />
      {!isUser && <PayoutSettingsForm settings={settings} />}
      <PurchaseDocuments purchases={saftPurchases} profileComplete={isProfileComplete(user)} />
      <NotificationsForm notifications={notifications} />
    </div>
  );
}
