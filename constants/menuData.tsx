import { LayoutDashboard, Users, Settings, LogOut } from "lucide-react";

export interface MenuItem {
  title: string;
  path?: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
}

export const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    path: "/",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    title: "Customers",
    path: "/customers",
    icon: <Users className="w-5 h-5" />,
  },
  {
    title: "Settings",
    path: "/settings",
    icon: <Settings className="w-5 h-5" />,
    children: [
      { title: "Profile", path: "/settings/profile" },
      { title: "Security", path: "/settings/security" },
      { title: "Preferences", path: "/settings/preferences" },
    ],
  },
  {
    title: "Logout",
    path: "/logout",
    icon: <LogOut className="w-5 h-5" />,
  },
];
