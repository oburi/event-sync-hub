import { Home, Calendar, Users, CalendarDays, Zap, Bell } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAppMode } from "@/contexts/AppModeContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const organizerNav = [
  { title: "Home", url: "/", icon: Home },
  { title: "Events", url: "/events", icon: Calendar },
  { title: "Calendar", url: "/calendar", icon: CalendarDays },
  { title: "Team", url: "/team", icon: Users },
];

const volunteerNav = [
  { title: "Home", url: "/", icon: Home },
  { title: "Events", url: "/events", icon: Calendar },
  { title: "Calendar", url: "/calendar", icon: CalendarDays },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Team", url: "/team", icon: Users },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { mode } = useAppMode();

  const navItems = mode === "volunteer" ? volunteerNav : organizerNav;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <p className="text-sm font-semibold text-foreground">Syncra</p>
              <p className="text-[11px] text-muted-foreground">
                {mode === "volunteer" ? "Volunteer" : "Event Ops"}
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-accent/60"
                      activeClassName="bg-accent text-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
