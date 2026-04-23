import { verifySession } from "@/lib/dal";
import { getUserById } from "@/db/queries/users";
import { getSettingsByUser } from "@/db/queries/user-settings";
import { getNotificationsByUser } from "@/db/queries/user-notifications";
import { ProfileForm } from "@/features/settings/components/ProfileForm";
import { PayoutSettingsForm } from "@/features/settings/components/PayoutSettingsForm";
import { NotificationsForm } from "@/features/settings/components/NotificationsForm";

export default async function SettingsPage() {
  const session = await verifySession();
  const [user, settings, notifications] = await Promise.all([
    getUserById(session.id),
    getSettingsByUser(session.id),
    getNotificationsByUser(session.id),
  ]);

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted mt-1">Manage your profile, payouts, and notifications</p>
      </div>
      <ProfileForm name={user?.name ?? session.name ?? ""} email={user?.email ?? session.email ?? ""} />
      <PayoutSettingsForm settings={settings} />
      <NotificationsForm notifications={notifications} />
    </div>
  );
}
