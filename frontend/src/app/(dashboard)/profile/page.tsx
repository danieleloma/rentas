'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils/format';
import {
  User, ShieldCheck, Bell, Lock, Trash2, Phone,
  ChevronRight, LogOut, Shield,
} from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  renter: 'Renter',
  landlord: 'Landlord',
  mover: 'Mover',
  admin: 'Admin',
};

// ── Toggle row ────────────────────────────────────────────────────────────────

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          checked ? 'bg-primary' : 'bg-input'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 border-b border-border pb-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, logout } = useAuth();

  // Notification prefs (local state — persisted to DB in a future iteration)
  const [notifs, setNotifs] = useState({
    messages: true,
    visitUpdates: true,
    reviewResponses: true,
    bookingUpdates: true,
    push: true,
    email: true,
  });

  const [phoneInput, setPhoneInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  if (!user) return null;

  const displayName = `${user.firstName} ${user.lastName}`.trim() || user.email;
  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || user.email[0].toUpperCase();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Profile & Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account, verification, and preferences</p>
      </div>

      {/* ── Identity card ── */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-wrap items-start gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-border">
              <AvatarImage src={user.avatarUrl ?? undefined} alt={displayName} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-lg font-bold text-foreground truncate">{displayName}</p>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {ROLE_LABELS[user.role] ?? user.role}
                </Badge>
                {user.emailVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 border border-green-200">
                    <ShieldCheck className="h-3 w-3" /> Email verified
                  </span>
                )}
                {user.phoneVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 border border-green-200">
                    <ShieldCheck className="h-3 w-3" /> Phone verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
                    <Phone className="h-3 w-3" /> Phone unverified
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Member since {formatDate(user.createdAt)}</p>
            </div>
            <Button variant="outline" size="sm" className="shrink-0" onClick={() => logout()}>
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Log out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Personal info ── */}
      <Card>
        <CardHeader>
          <SectionHeader icon={User} title="Personal information" description="Your name, phone, and contact details" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">First name</label>
              <input
                defaultValue={user.firstName}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="First name"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">Last name</label>
              <input
                defaultValue={user.lastName}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Last name"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">Email address</label>
            <input
              value={user.email}
              readOnly
              className="w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed here — contact support.</p>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">Phone number</label>
            <input
              defaultValue={user.phone ?? ''}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="+234 800 000 0000"
            />
          </div>
          <Button size="sm">Save changes</Button>
        </CardContent>
      </Card>

      {/* ── Verification ── */}
      <Card id="verification">
        <CardHeader>
          <SectionHeader icon={Shield} title="Verification" description="Verify your identity to build trust with renters" />
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Phone verification */}
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Phone verification</span>
              </div>
              {user.phoneVerified ? (
                <Badge className="bg-green-600 text-white hover:bg-green-600">Verified</Badge>
              ) : (
                <Badge variant="outline" className="text-amber-600 border-amber-300">Not verified</Badge>
              )}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              A verified phone badge appears on your listings and messages, increasing your contact rate by 3×.
            </p>

            {!user.phoneVerified && (
              <div className="mt-3 space-y-2">
                {!otpSent ? (
                  <div className="flex gap-2">
                    <input
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="+234 800 000 0000"
                    />
                    <Button
                      size="sm"
                      onClick={() => setOtpSent(true)}
                      disabled={!phoneInput.trim()}
                    >
                      Send OTP
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Enter the 6-digit code sent to {phoneInput}</p>
                    <div className="flex gap-2">
                      <input
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        maxLength={6}
                        className="w-32 rounded-lg border border-input bg-background px-3 py-2 text-sm text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="000000"
                      />
                      <Button size="sm" disabled={otpInput.length !== 6}>
                        Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setOtpSent(false); setOtpInput(''); }}
                      >
                        Change number
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* NIN / BVN — Phase 2 */}
          <div className="rounded-lg border border-dashed border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">NIN / BVN verification</span>
              </div>
              <Badge variant="outline" className="text-xs text-muted-foreground">Phase 2</Badge>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Full identity verification for the highest trust tier. Coming soon.
            </p>
          </div>

          {/* Role */}
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Account role</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Current role: <span className="font-semibold text-foreground">{ROLE_LABELS[user.role] ?? user.role}</span>.
              Role upgrades (renter → landlord) are reviewed by our team.
            </p>
            {user.role === 'renter' && (
              <Button size="sm" variant="outline" className="mt-3">
                Request landlord upgrade
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Notifications ── */}
      <Card>
        <CardHeader>
          <SectionHeader icon={Bell} title="Notifications" description="Choose what you want to be notified about" />
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Channels</p>
            <div className="divide-y divide-border">
              <ToggleRow
                label="Push notifications"
                description="Alerts on your device"
                checked={notifs.push}
                onChange={(v) => setNotifs((p) => ({ ...p, push: v }))}
              />
              <ToggleRow
                label="Email notifications"
                description="Summary emails for low-priority events"
                checked={notifs.email}
                onChange={(v) => setNotifs((p) => ({ ...p, email: v }))}
              />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Events</p>
            <div className="divide-y divide-border">
              <ToggleRow
                label="New messages"
                checked={notifs.messages}
                onChange={(v) => setNotifs((p) => ({ ...p, messages: v }))}
              />
              <ToggleRow
                label="Visit updates"
                description="Approvals, rejections, reminders"
                checked={notifs.visitUpdates}
                onChange={(v) => setNotifs((p) => ({ ...p, visitUpdates: v }))}
              />
              <ToggleRow
                label="Review responses"
                checked={notifs.reviewResponses}
                onChange={(v) => setNotifs((p) => ({ ...p, reviewResponses: v }))}
              />
              <ToggleRow
                label="Booking updates"
                description="Mover booking confirmations and changes"
                checked={notifs.bookingUpdates}
                onChange={(v) => setNotifs((p) => ({ ...p, bookingUpdates: v }))}
              />
            </div>
          </div>
          <Button size="sm" className="mt-4">Save preferences</Button>
        </CardContent>
      </Card>

      {/* ── Security ── */}
      <Card>
        <CardHeader>
          <SectionHeader icon={Lock} title="Security" description="Password and active sessions" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-3 text-sm font-medium text-foreground">Change password</p>
            <div className="space-y-3">
              <input
                type="password"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Current password"
              />
              <input
                type="password"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="New password"
              />
              <input
                type="password"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Confirm new password"
              />
              <Button size="sm">Update password</Button>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Active sessions</p>
                <p className="text-xs text-muted-foreground">This device — current session</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => logout()}
              >
                Log out all devices
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Danger zone ── */}
      <Card className="border-destructive/40">
        <CardHeader>
          <SectionHeader icon={Trash2} title="Danger zone" description="Irreversible account actions" />
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm font-medium text-foreground">Delete account</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Your account will be deactivated immediately and permanently deleted after 30 days.
              All listings, conversations, and history will be removed.
            </p>
            {!deleteConfirm ? (
              <Button
                size="sm"
                variant="destructive"
                className="mt-3"
                onClick={() => setDeleteConfirm(true)}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Delete my account
              </Button>
            ) : (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-semibold text-destructive">
                  Are you absolutely sure? This cannot be undone.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="destructive">
                    Yes, delete my account
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
