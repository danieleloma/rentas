"use client"

import * as React from "react"
import Link from "next/link"
import { useAuthStore } from "@/store/authStore"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  HomeIcon,
  InboxIcon,
  MessageSquareIcon,
  CalendarIcon,
  UserIcon,
  PlusCircleIcon,
  SettingsIcon,
  HelpCircleIcon,
  BuildingIcon,
} from "lucide-react"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((s) => s.user)
  const isLandlord = user?.role === "landlord" || user?.role === "admin"

  const navMain = [
    { title: "Dashboard", url: "/dashboard", icon: <LayoutDashboardIcon /> },
    { title: "Listings", url: "/browse", icon: <HomeIcon /> },
    ...(isLandlord
      ? [
          { title: "My Listings", url: "/listings/manage", icon: <BuildingIcon /> },
          { title: "Inquiries", url: "/inquiries", icon: <InboxIcon /> },
        ]
      : []),
    { title: "Messages", url: "/messages", icon: <MessageSquareIcon /> },
    { title: "Visits", url: "/visits", icon: <CalendarIcon /> },
    { title: "Profile", url: "/profile", icon: <UserIcon /> },
    ...(isLandlord
      ? [{ title: "New Listing", url: "/listings/new", icon: <PlusCircleIcon /> }]
      : []),
  ]

  const navSecondary = [
    { title: "Settings", url: "/profile", icon: <SettingsIcon /> },
    { title: "Help", url: "#", icon: <HelpCircleIcon /> },
  ]

  const navUser = {
    name: user ? `${user.firstName} ${user.lastName}`.trim() : "Guest",
    email: user?.email ?? "",
    avatar: user?.avatarUrl ?? "",
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/dashboard" />}
            >
              <span className="text-base font-semibold">Rentas</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
