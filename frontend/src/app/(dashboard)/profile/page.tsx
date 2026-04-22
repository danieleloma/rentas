'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils/format';
import { User, Settings, ShieldCheck, LogOut } from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  renter: 'Renter',
  landlord: 'Landlord',
  mover: 'Mover',
  admin: 'Admin',
};

export default function ProfilePage() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const displayName = `${user.firstName} ${user.lastName}`.trim() || user.email;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <User className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">Profile</h1>
          <p className="text-sm text-muted-foreground">Your account details and preferences</p>
        </div>
      </div>

      {/* Identity card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-start gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-border">
              <AvatarImage src={user.avatarUrl ?? undefined} alt={displayName} />
              <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-1 min-w-0">
              <p className="text-lg font-bold text-foreground truncate">{displayName}</p>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {ROLE_LABELS[user.role] ?? user.role}
                </span>
                {user.emailVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    <ShieldCheck className="h-3 w-3" /> Email verified
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Member since {formatDate(user.createdAt)}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => logout()}
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Log out
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Edit profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">Edit profile</p>
          </div>
          <p className="text-xs text-muted-foreground">Update your name, photo, and contact details</p>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-10 text-center">
            <p className="text-sm font-medium text-muted-foreground">Coming soon</p>
            <p className="mt-1 text-xs text-muted-foreground/70">Profile editing will be available shortly</p>
          </div>
        </CardContent>
      </Card>

      {/* Account settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">Account settings</p>
          </div>
          <p className="text-xs text-muted-foreground">Password, notifications, and security</p>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-10 text-center">
            <p className="text-sm font-medium text-muted-foreground">Coming soon</p>
            <p className="mt-1 text-xs text-muted-foreground/70">Security settings will be available shortly</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
