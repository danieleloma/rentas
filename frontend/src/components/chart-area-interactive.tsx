"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { useQuery } from "@tanstack/react-query"

import { useIsMobile } from "@/hooks/use-mobile"
import { useAuthStore } from "@/store/authStore"
import { supabase } from "@/lib/supabase"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

type Range = "7d" | "30d"

interface DayPoint {
  date: string
  views: number
  inquiries: number
}

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", { month: "short", day: "numeric" })
}

function buildDateRange(days: number): string[] {
  const result: string[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    result.push(d.toISOString().slice(0, 10))
  }
  return result
}

function useLandlordPerformance(userId: string, days: number) {
  return useQuery({
    queryKey: ["landlord-perf", userId, days],
    queryFn: async (): Promise<DayPoint[]> => {
      const dates = buildDateRange(days)
      const since = new Date()
      since.setDate(since.getDate() - days)
      const sinceIso = since.toISOString()

      // Get landlord's listing IDs
      const { data: listings } = await supabase
        .from("listings")
        .select("id")
        .eq("landlord_id", userId)
        .neq("status", "deleted")

      const listingIds = (listings ?? []).map((l: { id: string }) => l.id)

      // Parallel: views + inquiries
      const [viewsRes, inquiriesRes] = await Promise.all([
        listingIds.length
          ? supabase
              .from("listing_views")
              .select("viewed_at")
              .in("listing_id", listingIds)
              .gte("viewed_at", sinceIso)
          : Promise.resolve({ data: [], error: null }),
        supabase
          .from("inquiries")
          .select("created_at")
          .eq("landlord_id", userId)
          .gte("created_at", sinceIso),
      ])

      // Bucket by date
      const viewsByDay: Record<string, number> = {}
      const inquiriesByDay: Record<string, number> = {}
      dates.forEach((d) => { viewsByDay[d] = 0; inquiriesByDay[d] = 0 })

      for (const row of viewsRes.data ?? []) {
        const day = (row.viewed_at as string).slice(0, 10)
        if (viewsByDay[day] !== undefined) viewsByDay[day]++
      }
      for (const row of inquiriesRes.data ?? []) {
        const day = (row.created_at as string).slice(0, 10)
        if (inquiriesByDay[day] !== undefined) inquiriesByDay[day]++
      }

      return dates.map((d) => ({ date: d, views: viewsByDay[d], inquiries: inquiriesByDay[d] }))
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const user = useAuthStore((s) => s.user)
  const [range, setRange] = React.useState<Range>("7d")
  const isLandlord = user?.role === "landlord" || user?.role === "admin"

  React.useEffect(() => {
    if (isMobile) setRange("7d")
  }, [isMobile])

  const days = range === "7d" ? 7 : 30
  const { data: chartData, isLoading } = useLandlordPerformance(user?.id ?? "", days)

  if (!isLandlord) return null

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Listing performance</CardTitle>
        <CardDescription>
          Views and inquiries across all your active listings
        </CardDescription>
        <CardAction>
          <ToggleGroup
            multiple={false}
            value={range ? [range] : []}
            onValueChange={(v) => { if (v[0]) setRange(v[0] as Range) }}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={range} onValueChange={(v) => setRange(v as Range)}>
            <SelectTrigger
              className="flex w-36 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="7d" className="rounded-lg">Last 7 days</SelectItem>
              <SelectItem value="30d" className="rounded-lg">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <Skeleton className="h-[200px] w-full rounded-lg" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData ?? []} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gradViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradInquiries" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-2, #10b981)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-2, #10b981)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickFormatter={formatDay}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "var(--foreground)",
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any, name: any) => [
                  value ?? 0,
                  name === "views" ? "Views" : "Inquiries",
                ]}
                labelFormatter={(label) => formatDay(label as string)}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="var(--primary)"
                strokeWidth={2}
                fill="url(#gradViews)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="inquiries"
                stroke="var(--chart-2, #10b981)"
                strokeWidth={2}
                fill="url(#gradInquiries)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Views
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Inquiries
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
