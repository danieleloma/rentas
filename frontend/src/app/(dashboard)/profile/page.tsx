'use client';

import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils/format';

function roleLabel(role: string): string {
  const map: Record<string, string> = {
    renter: 'Renter',
    landlord: 'Landlord',
    mover: 'Mover',
    admin: 'Admin',
  };
  return map[role] ?? role;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const displayName = `${user.firstName} ${user.lastName}`.trim() || user.email;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-600">
          Your account details and preferences.
        </p>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row flex-wrap items-center gap-4 pb-4 sm:items-start">
          <Avatar className="size-14 ring-2 ring-white shadow-md">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={displayName} />
            <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="truncate text-lg font-semibold text-gray-900">
              {displayName}
            </p>
            <p className="truncate text-sm text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-700">Role:</span>{' '}
              {roleLabel(user.role)}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-700">Member since</span>{' '}
              {formatDate(user.createdAt)}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full shrink-0 sm:w-auto"
            onClick={() => logout()}
          >
            Log out
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-gray-900">
            Edit profile
          </h2>
          <p className="text-sm text-gray-500">
            Update your name, photo, and contact details.
          </p>
        </CardHeader>
        <CardContent>
          <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50/80 px-4 py-8 text-center text-sm text-gray-500">
            Coming soon
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-gray-900">
            Account settings
          </h2>
          <p className="text-sm text-gray-500">
            Password, notifications, and security.
          </p>
        </CardHeader>
        <CardContent>
          <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50/80 px-4 py-8 text-center text-sm text-gray-500">
            Coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
