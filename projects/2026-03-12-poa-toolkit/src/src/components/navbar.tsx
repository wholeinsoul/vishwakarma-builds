"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@supabase/supabase-js";
import {
  Shield,
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const navLinks = [
    { href: "/banks", label: "Banks", icon: Building2 },
    ...(user
      ? [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }]
      : []),
  ];

  return (
    <nav className="bg-navy-600 text-white sticky top-0 z-50 border-b border-navy-500">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Shield className="h-6 w-6 text-amber-400" />
            <span>ConcretePOA</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-amber-300 ${
                  pathname.startsWith(link.href)
                    ? "text-amber-400"
                    : "text-navy-100"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}

            <Link href="/intake">
              <Button
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-navy-900 font-bold"
              >
                Get Started
              </Button>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-navy-500"
                  >
                    {user.email?.split("@")[0]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600 text-navy-900 font-semibold"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${
                  pathname.startsWith(link.href)
                    ? "bg-navy-500 text-amber-400"
                    : "text-navy-100 hover:bg-navy-500"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
            <Link
              href="/intake"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2"
            >
              <Button
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-navy-900 font-bold w-full"
              >
                Get Started
              </Button>
            </Link>
            {user ? (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 rounded text-sm text-navy-100 hover:bg-navy-500 w-full"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            ) : (
              <Link
                href="/auth"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2"
              >
                <Button
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600 text-navy-900 font-semibold w-full"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
