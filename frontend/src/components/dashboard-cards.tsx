"use client"

import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Building2, Inbox, Calendar, MessageSquare, ArrowRight,
  Heart, Home, Check, X, Truck, CheckCircle2, Circle,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/authStore"
import { useUIStore } from "@/store/uiStore"
import { getInquiriesApi } from "@/lib/api/inquiries"
import { updateVisitStatusApi } from "@/lib/api/visits"
import { supabase } from "@/lib/supabase"
import { formatCurrency, formatDateTime, formatRelativeTime } from "@/lib/utils/format"
import { DEMO_RENTER_STATS, DEMO_SAVED_LISTINGS, DEMO_STATS, DEMO_VISITS } from "@/lib/demo-data"

// ── Helpers ────────────────────────────────────────────────────────────────────

function hoursAgo(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 1000 / 60 / 60
}

function UrgencyDot({ hours }: { hours: number }) {
  const color = hours < 4 ? "bg-green-500" : hours < 24 ? "bg-amber-400" : "bg-red-500"
  const title = hours < 4 ? "< 4h ago" : hours < 24 ? "4–24h ago" : "> 24h ago"
  return <span title={title} className={`mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full ${color}`} />
}

// ── Stat card ──────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  href,
}: {
  label: string
  value: number | string
  icon: React.ElementType
  href: string
}) {
  return (
    <Link href={href}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <p className="mt-1.5 text-3xl font-bold tabular-nums text-foreground">{value}</p>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
            <span>View details</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// ── Landlord dashboard ─────────────────────────────────────────────────────────

function LandlordDashboard({ userId }: { userId: string }) {
  const queryClient = useQueryClient()
  const addToast = useUIStore((s) => s.addToast)

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data: inquiries = [] } = useQuery({
    queryKey: ["inquiries"],
    queryFn: getInquiriesApi,
    staleTime: 2 * 60 * 1000,
  })

  const { data: listingsCount = 0 } = useQuery({
    queryKey: ["my-listings-count", userId],
    queryFn: async () => {
      const { count } = await supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("landlord_id", userId)
        .eq("status", "active")
      return (count ?? 0) || DEMO_STATS.activeListings
    },
  })

  const { data: pendingVisitsCount = 0 } = useQuery({
    queryKey: ["pending-visits-count", userId],
    queryFn: async () => {
      const { count } = await supabase
        .from("visits")
        .select("id", { count: "exact", head: true })
        .eq("landlord_id", userId)
        .eq("status", "pending")
      return (count ?? 0) || DEMO_STATS.pendingVisits
    },
  })

  const { data: unreadMessages = 0 } = useQuery({
    queryKey: ["unread-messages-count", userId],
    queryFn: async () => {
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("is_read", false)
        .neq("sender_id", userId)
      return (count ?? 0) || DEMO_STATS.unreadMessages
    },
  })

  // Pending visits with full data for the action widget
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pendingVisitsList = [] } = useQuery<any[]>({
    queryKey: ["dashboard-pending-visits", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("visits")
        .select(`
          id, scheduled_at, viewing_type,
          listing:listings(id, title),
          renter:users!renter_id(id, first_name, last_name)
        `)
        .eq("landlord_id", userId)
        .eq("status", "pending")
        .order("scheduled_at", { ascending: true })
        .limit(5)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = (data ?? []) as any[]
      if (rows.length > 0) return rows
      // Fall back to demo visits shaped to match the query structure
      return DEMO_VISITS.map((v) => ({
        id: v.id,
        scheduled_at: v.scheduledAt,
        viewing_type: 'in_person',
        listing: { id: v.listingId, title: v.listingTitle },
        renter: { id: 'demo-renter', first_name: v.renterName.split(' ')[0], last_name: v.renterName.split(' ')[1] ?? '' },
      }))
    },
    staleTime: 2 * 60 * 1000,
  })

  // ── Mutations ──────────────────────────────────────────────────────────────

  const invalidateVisits = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard-pending-visits", userId] })
    queryClient.invalidateQueries({ queryKey: ["pending-visits-count", userId] })
    queryClient.invalidateQueries({ queryKey: ["visits"] })
  }

  const approveMutation = useMutation({
    mutationFn: (id: string) => updateVisitStatusApi(id, "approved"),
    onSuccess: () => { invalidateVisits(); addToast("Visit approved", "success") },
    onError: () => addToast("Failed to approve visit", "error"),
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => updateVisitStatusApi(id, "rejected"),
    onSuccess: () => { invalidateVisits(); addToast("Visit rejected", "success") },
    onError: () => addToast("Failed to reject visit", "error"),
  })

  const isMutating = approveMutation.isPending || rejectMutation.isPending
  const recentInquiries = inquiries.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* ── KPI bar ── */}
      <div className="grid grid-cols-2 gap-4 @xl/main:grid-cols-4">
        <StatCard label="Active Listings" value={listingsCount} icon={Building2} href="/listings/manage" />
        <StatCard label="Inquiries" value={inquiries.length} icon={Inbox} href="/inquiries" />
        <StatCard label="Pending Visits" value={pendingVisitsCount} icon={Calendar} href="/visits" />
        <StatCard label="Unread Messages" value={unreadMessages} icon={MessageSquare} href="/messages" />
      </div>

      {/* ── 2-col widgets ── */}
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2">

        {/* Recent Inquiries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
            <CardTitle className="text-sm font-semibold">Recent Inquiries</CardTitle>
            <Link href="/inquiries" className="text-xs text-muted-foreground hover:underline underline-offset-4">
              View all
            </Link>
          </CardHeader>
          <CardContent className="pt-3">
            {recentInquiries.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No inquiries yet.</p>
            ) : (
              <div className="divide-y overflow-hidden" style={{ maxHeight: 284 }}>
                {recentInquiries.map((inq) => {
                  const hours = hoursAgo(inq.createdAt)
                  return (
                    <div key={inq.id} className="flex items-start gap-2.5 py-3 first:pt-0 last:pb-0">
                      <UrgencyDot hours={hours} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-sm font-medium text-foreground">{inq.name}</p>
                          <p className="shrink-0 text-xs text-muted-foreground">
                            {formatRelativeTime(inq.createdAt)}
                          </p>
                        </div>
                        {inq.listing?.title && (
                          <p className="truncate text-xs text-muted-foreground">Re: {inq.listing.title}</p>
                        )}
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{inq.message}</p>
                        <Link
                          href="/messages"
                          className="mt-1 inline-block text-xs font-medium text-primary hover:underline"
                        >
                          Open in Messages →
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Visits Needing Action */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
            <CardTitle className="text-sm font-semibold">Visits Needing Action</CardTitle>
            <Link href="/visits" className="text-xs text-muted-foreground hover:underline underline-offset-4">
              View all
            </Link>
          </CardHeader>
          <CardContent className="pt-3">
            {pendingVisitsList.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No pending visit requests.
              </p>
            ) : (
              <div className="divide-y overflow-hidden" style={{ maxHeight: 284 }}>
                {pendingVisitsList.map((visit) => (
                  <div key={visit.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {visit.listing?.title ?? "Listing"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {visit.renter?.first_name} {visit.renter?.last_name}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(visit.scheduled_at)}
                        </span>
                        <Badge variant="outline" className="py-0 text-[10px] capitalize">
                          {visit.viewing_type.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => approveMutation.mutate(visit.id)}
                        disabled={isMutating}
                      >
                        <Check className="mr-1 h-3 w-3" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 text-xs"
                        onClick={() => rejectMutation.mutate(visit.id)}
                        disabled={isMutating}
                      >
                        <X className="mr-1 h-3 w-3" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ── Renter dashboard ───────────────────────────────────────────────────────────

function RenterDashboard({ userId }: { userId: string }) {
  const { data: upcomingVisits = 0 } = useQuery({
    queryKey: ["upcoming-visits-count", userId],
    queryFn: async () => {
      const { count } = await supabase
        .from("visits")
        .select("id", { count: "exact", head: true })
        .eq("renter_id", userId)
        .in("status", ["pending", "approved"])
      return count ?? 0
    },
  })

  const { data: unreadMessages = 0 } = useQuery({
    queryKey: ["unread-messages-count", userId],
    queryFn: async () => {
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("is_read", false)
        .neq("sender_id", userId)
      return count ?? 0
    },
  })

  const { data: savedCount = 0 } = useQuery({
    queryKey: ["saved-listings-count", userId],
    queryFn: async () => {
      const { count } = await supabase
        .from("favorites")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
      return (count ?? 0) || DEMO_RENTER_STATS.savedListings
    },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: savedPreviews = DEMO_SAVED_LISTINGS as any[] } = useQuery<any[]>({
    queryKey: ["saved-listings-preview", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("favorites")
        .select("listing:listings(id, title, price, city, listing_images(url))")
        .eq("user_id", userId)
        .limit(3)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = (data ?? []) as any[]
      if (rows.length > 0) {
        return rows.map((r) => ({
          id: r.listing?.id,
          title: r.listing?.title,
          price: r.listing?.price,
          city: r.listing?.city,
          imageUrl: r.listing?.listing_images?.[0]?.url ?? null,
        })).filter((l) => l.id)
      }
      return DEMO_SAVED_LISTINGS
    },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: activeMoverBooking = null } = useQuery<any>({
    queryKey: ["active-mover-booking", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("mover_bookings")
        .select("id, status, scheduled_date, mover:movers(business_name)")
        .eq("renter_id", userId)
        .in("status", ["requested", "confirmed", "in_progress"])
        .order("scheduled_date", { ascending: true })
        .limit(1)
        .maybeSingle()
      return data
    },
  })

  // Show onboarding checklist only when renter has no real activity yet
  const isNewRenter = upcomingVisits === 0 && unreadMessages === 0

  const onboardingSteps = [
    { label: "Complete your profile", href: "/profile", done: false },
    { label: "Browse available listings", href: "/browse", done: savedCount > 0 || upcomingVisits > 0 },
    { label: "Save a favourite", href: "/browse", done: savedCount > 0 },
    { label: "Schedule a viewing", href: "/browse", done: upcomingVisits > 0 },
  ]

  const moverStatusLabel: Record<string, string> = {
    requested: "Awaiting confirmation",
    confirmed: "Confirmed",
    in_progress: "In progress",
  }

  const quickActions = [
    { label: "Browse Listings", href: "/browse", icon: Home, desc: "Search available rentals" },
    { label: "My Visits", href: "/visits", icon: Calendar, desc: "Upcoming & past viewings" },
    { label: "Messages", href: "/messages", icon: MessageSquare, desc: "Chat with landlords" },
    { label: "Saved Listings", href: "/browse?saved=1", icon: Heart, desc: "Your favourited properties" },
  ]

  return (
    <div className="space-y-6">
      {/* ── KPI bar ── */}
      <div className="grid grid-cols-2 gap-4 @xl/main:grid-cols-4">
        <StatCard label="Upcoming Visits" value={upcomingVisits} icon={Calendar} href="/visits" />
        <StatCard label="Unread Messages" value={unreadMessages} icon={MessageSquare} href="/messages" />
        <StatCard label="Saved Listings" value={savedCount} icon={Heart} href="/browse?saved=1" />
        {activeMoverBooking ? (
          <Link href="/movers">
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Mover Booking</p>
                    <p className="mt-1 text-sm font-semibold text-foreground line-clamp-1">
                      {activeMoverBooking.mover?.business_name ?? "Moving service"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground capitalize">
                      {moverStatusLabel[activeMoverBooking.status] ?? activeMoverBooking.status}
                    </p>
                  </div>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Truck className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                  <span>View booking</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ) : (
          <Link href="/movers">
            <Card className="h-full border-dashed transition-shadow hover:shadow-sm">
              <CardContent className="flex h-full flex-col items-center justify-center gap-2 py-6 text-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                  <Truck className="size-4 text-secondary-foreground" />
                </div>
                <p className="text-xs font-medium text-muted-foreground">Book a mover</p>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      {/* ── 2-col widgets ── */}
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2">

        {/* Saved listings preview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
            <CardTitle className="text-sm font-semibold">Saved Listings</CardTitle>
            <Link href="/browse?saved=1" className="text-xs text-muted-foreground hover:underline underline-offset-4">
              View all
            </Link>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="divide-y">
              {savedPreviews.slice(0, 3).map((listing) => (
                <Link
                  key={listing.id}
                  href={`/browse/${listing.id}`}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 group"
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                    {listing.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={listing.imageUrl} alt={listing.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Home className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {listing.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{listing.city}</p>
                    {listing.price && (
                      <p className="text-xs font-medium text-primary">
                        {formatCurrency(listing.price)}<span className="text-muted-foreground font-normal">/yr</span>
                      </p>
                    )}
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Onboarding checklist (new renters) or quick actions (active renters) */}
        {isNewRenter ? (
          <Card>
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-sm font-semibold">Get started</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Complete these steps to find your home</p>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="space-y-1">
                {onboardingSteps.map(({ label, href, done }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-muted/60"
                  >
                    {done ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className={`text-sm ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {label}
                    </span>
                    {!done && <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map(({ label, href, icon: Icon }) => (
                  <Link key={href} href={href}>
                    <div className="flex items-center gap-2.5 rounded-md border border-border px-3 py-2.5 transition-colors hover:bg-muted/60">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary">
                        <Icon className="h-3.5 w-3.5 text-secondary-foreground" />
                      </div>
                      <p className="text-xs font-medium text-foreground">{label}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// ── Root ───────────────────────────────────────────────────────────────────────

export function DashboardCards() {
  const user = useAuthStore((s) => s.user)
  const isLandlord = user?.role === "landlord" || user?.role === "admin"

  if (!user) return null

  return isLandlord
    ? <LandlordDashboard userId={user.id} />
    : <RenterDashboard userId={user.id} />
}
