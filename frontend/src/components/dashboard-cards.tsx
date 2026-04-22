"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import {
  Building2,
  Inbox,
  Calendar,
  MessageSquare,
  ArrowRight,
  Heart,
  TrendingUp,
  Home,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
  CardFooter,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/store/authStore"
import { getInquiriesApi } from "@/lib/api/inquiries"
import { supabase } from "@/lib/supabase"
import { formatDate } from "@/lib/utils/format"

// ── Stat card ──────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  trend,
}: {
  label: string
  value: number | string
  icon: React.ElementType
  href: string
  trend?: string
}) {
  return (
    <Link href={href}>
      <Card className="@container/card hover:shadow-sm transition-shadow">
        <CardHeader>
          <CardDescription>{label}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {value}
          </CardTitle>
          {trend && (
            <CardAction>
              <Badge variant="outline">
                <TrendingUp className="size-3" />
                {trend}
              </Badge>
            </CardAction>
          )}
        </CardHeader>
        <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Icon className="size-4" />
            <span>{label}</span>
          </div>
          <ArrowRight className="size-4" />
        </CardFooter>
      </Card>
    </Link>
  )
}

// ── Landlord dashboard ─────────────────────────────────────────────────────

function LandlordDashboard({ userId }: { userId: string }) {
  const { data: inquiries = [] } = useQuery({
    queryKey: ["inquiries"],
    queryFn: getInquiriesApi,
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

  const { data: pendingVisits = 0 } = useQuery({
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

  const recentInquiries = inquiries.slice(0, 5)

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* KPI cards — PRD §2.1: listings, inquiries, visits, messages */}
      <div className="grid grid-cols-2 gap-4 @xl/main:grid-cols-4">
        <StatCard label="Active Listings" value={listingsCount} icon={Building2} href="/listings" />
        <StatCard label="Inquiries" value={inquiries.length} icon={Inbox} href="/inquiries" />
        <StatCard label="Pending Visits" value={pendingVisits} icon={Calendar} href="/visits" />
        <StatCard label="Unread Messages" value={unreadMessages} icon={MessageSquare} href="/messages" />
      </div>

      {/* Recent inquiries table — PRD §5.2 step 6 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <CardTitle className="text-sm font-semibold">Recent Inquiries</CardTitle>
          <Link
            href="/inquiries"
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent className="pt-4">
          {recentInquiries.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No inquiries yet.</p>
          ) : (
            <div className="divide-y">
              {recentInquiries.map((inq) => (
                <div key={inq.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{inq.name}</p>
                    {inq.listing?.title && (
                      <p className="truncate text-xs text-muted-foreground">Re: {inq.listing.title}</p>
                    )}
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{inq.message}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-muted-foreground">{formatDate(inq.createdAt)}</p>
                    {inq.email && (
                      <a href={`mailto:${inq.email}`} className="mt-1 text-xs font-medium hover:underline">
                        Reply
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending visits — PRD FR-027 */}
      {pendingVisits > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <CardTitle className="text-sm font-semibold">
              {pendingVisits} visit{pendingVisits !== 1 ? "s" : ""} awaiting approval
            </CardTitle>
            <Link href="/visits" className="text-xs text-muted-foreground underline-offset-4 hover:underline">
              Review visits
            </Link>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}

// ── Renter dashboard ───────────────────────────────────────────────────────

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
    <div className="space-y-6 px-4 lg:px-6">
      {/* KPI cards — PRD §2.1: visits, messages */}
      <div className="grid grid-cols-2 gap-4 @xl/main:grid-cols-4">
        <StatCard label="Upcoming Visits" value={upcomingVisits} icon={Calendar} href="/visits" />
        <StatCard label="Unread Messages" value={unreadMessages} icon={MessageSquare} href="/messages" />
      </div>

      {/* Quick actions — PRD §5.1 renter journey */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map(({ label, href, icon: Icon, desc }) => (
          <Link key={href} href={href}>
            <Card className="h-full hover:shadow-sm transition-shadow">
              <CardContent className="flex flex-col gap-2 pt-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                  <Icon className="size-5 text-secondary-foreground" />
                </div>
                <p className="font-medium text-sm">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ── Root ───────────────────────────────────────────────────────────────────

export function DashboardCards() {
  const user = useAuthStore((s) => s.user)
  const isLandlord = user?.role === "landlord" || user?.role === "admin"

  if (!user) return null

  return isLandlord
    ? <LandlordDashboard userId={user.id} />
    : <RenterDashboard userId={user.id} />
}
