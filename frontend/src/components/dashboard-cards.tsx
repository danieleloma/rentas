"use client"

import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Building2, Inbox, Calendar, MessageSquare, ArrowRight,
  Heart, Home, Check, X,
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
import { formatDateTime, formatRelativeTime } from "@/lib/utils/format"

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
      return count ?? 0
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
      return (data ?? []) as any[]
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
              <div className="divide-y">
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
              <div className="divide-y">
                {pendingVisitsList.map((visit) => (
                  <div key={visit.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
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
                    <div className="mt-2 flex gap-2">
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

  const quickActions = [
    { label: "Browse Listings", href: "/listings", icon: Home, desc: "Search available rentals" },
    { label: "My Visits", href: "/visits", icon: Calendar, desc: "Upcoming & past viewings" },
    { label: "Messages", href: "/messages", icon: MessageSquare, desc: "Chat with landlords" },
    { label: "Saved Listings", href: "/listings?saved=1", icon: Heart, desc: "Your favourited properties" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 @xl/main:grid-cols-4">
        <StatCard label="Upcoming Visits" value={upcomingVisits} icon={Calendar} href="/visits" />
        <StatCard label="Unread Messages" value={unreadMessages} icon={MessageSquare} href="/messages" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map(({ label, href, icon: Icon, desc }) => (
          <Link key={href} href={href}>
            <Card className="h-full transition-shadow hover:shadow-sm">
              <CardContent className="flex flex-col gap-2 pt-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                  <Icon className="size-5 text-secondary-foreground" />
                </div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
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
