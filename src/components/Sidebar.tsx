"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  MapPin,
  CalendarCheck,
  FileText,
  BarChart3,
  LogOut,
  UserCircle,
  Building2,
} from "lucide-react";
import clsx from "clsx";

const adminNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/users", label: "User Management", icon: Users },
  { href: "/clients", label: "Clients", icon: Building2 },
  { href: "/visits", label: "Visit Planning", icon: MapPin },
  { href: "/my-visits", label: "My Visits", icon: CalendarCheck },
  { href: "/proposals", label: "Proposals", icon: FileText },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

const userNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/my-visits", label: "My Visits", icon: CalendarCheck },
  { href: "/proposals", label: "Proposals", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const nav = role === "admin" ? adminNav : userNav;

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-slate-200 flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-white">
          <LayoutDashboard className="w-6 h-6 text-primary-400" />
          VPMS
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition",
              pathname === item.href
                ? "bg-primary-600 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-slate-700">
        <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400">
          <UserCircle className="w-5 h-5" />
          <span className="truncate">{session?.user?.name ?? session?.user?.email}</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition"
        >
          <LogOut className="w-5 h-5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
