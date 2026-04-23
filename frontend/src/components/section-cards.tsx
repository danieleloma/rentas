"use client"

import { useQuery } from "@tanstack/react-query"
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuthStore } from "@/store/authStore"
import { supabase } from "@/lib/supabase"

interface KpiCard {
  label: string
  value: string
  trend?: { direction: "up" | "down" | "flat"; label: string }
  footer: string
}

function StatCard({ label, value, trend, footer }: KpiCard) {
  const Icon =
    trend?.direction === "up"
      ? TrendingUpIcon
      : trend?.direction === "down"
        ? TrendingDownIcon
        : MinusIcon

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value}
        </CardTitle>
        {trend && (
          <CardAction>
            <Badge variant="outline">
              <Icon className="size-3" />
              {trend.label}
            </Badge>
          </CardAction>
        )}
        <p className="mt-1 text-xs text-muted-foreground">{footer}</p>
      </CardHeader>
    </Card>
  )
}

function LandlordSectionCards({ userId }: { userId: string }) {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

  // Fetch listing IDs once — reused by all view queries
  const { data: listingIds = [] } = useQuery({
    queryKey: ["landlord-listing-ids", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("listings")
        .select("id")
        .eq("landlord_id", userId)
        .neq("status", "deleted")
      return (data ?? []).map((l) => l.id)
    },
    staleTime: 5 * 60 * 1000,
  })

  const { data: viewsThis = 0 } = useQuery({
    queryKey: ["landlord-views-this", userId, listingIds],
    enabled: listingIds.length > 0,
    queryFn: async () => {
      const { count } = await supabase
        .from("listing_views")
        .select("id", { count: "exact", head: true })
        .in("listing_id", listingIds)
        .gte("viewed_at", sevenDaysAgo)
      return count ?? 0
    },
  })

  const { data: viewsPrior = 0 } = useQuery({
    queryKey: ["landlord-views-prior", userId, listingIds],
    enabled: listingIds.length > 0,
    queryFn: async () => {
      const { count } = await supabase
        .from("listing_views")
        .select("id", { count: "exact", head: true })
        .in("listing_id", listingIds)
        .gte("viewed_at", fourteenDaysAgo)
        .lt("viewed_at", sevenDaysAgo)
      return count ?? 0
    },
  })

  const { data: inquiriesThis = 0 } = useQuery({
    queryKey: ["landlord-inquiries-this", userId],
    queryFn: async () => {
      const { count } = await supabase
        .from("inquiries")
        .select("id", { count: "exact", head: true })
        .eq("landlord_id", userId)
        .gte("created_at", sevenDaysAgo)
      return count ?? 0
    },
  })

  const { data: avgResponseHours } = useQuery({
    queryKey: ["landlord-response-time", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("inquiries")
        .select("created_at, first_response_at")
        .eq("landlord_id", userId)
        .not("first_response_at", "is", null)
        .gte("created_at", thirtyDaysAgo)
        .limit(50)
      if (!data?.length) return null
      const diffs = data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((r: any) =>
          (new Date(r.first_response_at).getTime() - new Date(r.created_at).getTime()) /
          1000 / 60 / 60
        )
        .filter((h: number) => h >= 0)
      if (!diffs.length) return null
      const sorted = [...diffs].sort((a: number, b: number) => a - b)
      return sorted[Math.floor(sorted.length / 2)]
    },
  })

  const { data: approvalData } = useQuery({
    queryKey: ["landlord-approval-rate", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("visits")
        .select("status")
        .eq("landlord_id", userId)
        .in("status", ["approved", "rejected"])
        .gte("created_at", thirtyDaysAgo)
      if (!data?.length) return null
      const approved = data.filter((v) => v.status === "approved").length
      return Math.round((approved / data.length) * 100)
    },
  })

  const viewsTrend: KpiCard["trend"] =
    viewsPrior === 0
      ? { direction: "flat", label: "No prior data" }
      : viewsThis > viewsPrior
        ? { direction: "up", label: `+${Math.round(((viewsThis - viewsPrior) / viewsPrior) * 100)}% vs last week` }
        : { direction: "down", label: `${Math.round(((viewsThis - viewsPrior) / viewsPrior) * 100)}% vs last week` }

  const contactRate = viewsThis > 0 ? ((inquiriesThis / viewsThis) * 100).toFixed(1) : "—"

  const responseLabel =
    avgResponseHours == null
      ? "No data yet"
      : avgResponseHours < 1
        ? `${Math.round(avgResponseHours * 60)}m median`
        : `${avgResponseHours.toFixed(1)}h median`

  const responseStatus: KpiCard["trend"] =
    avgResponseHours == null
      ? { direction: "flat", label: "No data" }
      : avgResponseHours <= 4
        ? { direction: "up", label: "On target" }
        : { direction: "down", label: "Above 4h target" }

  const approvalTrend: KpiCard["trend"] =
    approvalData == null
      ? { direction: "flat", label: "No decisions yet" }
      : approvalData >= 70
        ? { direction: "up", label: `${approvalData}%` }
        : { direction: "down", label: `${approvalData}%` }

  return (
    <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <StatCard
        label="Listing Views"
        value={viewsThis.toLocaleString()}
        trend={viewsTrend}
        footer="Last 7 days across all active listings"
      />
      <StatCard
        label="Contact Rate"
        value={`${contactRate}%`}
        footer="Inquiries ÷ views this week · Platform avg: 8%"
      />
      <StatCard
        label="Avg. Response Time"
        value={responseLabel}
        trend={responseStatus}
        footer="Target: reply within 4 hours · Last 30 days"
      />
      <StatCard
        label="Visit Approval Rate"
        value={approvalData != null ? `${approvalData}%` : "—"}
        trend={approvalTrend}
        footer="Approved ÷ decided visits · Last 30 days"
      />
    </div>
  )
}

export function SectionCards() {
  const user = useAuthStore((s) => s.user)
  const isLandlord = user?.role === "landlord" || user?.role === "admin"

  if (isLandlord && user) {
    return <LandlordSectionCards userId={user.id} />
  }

  return null
}
