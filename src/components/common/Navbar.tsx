"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  GraduationCap,
  Landmark,
  Layers,
  MapPin,
  Bot,
  Bookmark,
  User,
  LayoutDashboard,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  Search,
} from "lucide-react";
import { DatabaseStatusBadge } from "./DatabaseStatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { useSaved } from "@/context/SavedContext";

export const Navbar = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile } = useAuth();
  const { savedIds } = useSaved();

  const navLinks = [
    { href: "/", label: "Home", icon: Compass },
    { href: "/scholarships", label: "Scholarships", icon: GraduationCap },
    { href: "/schemes", label: "Govt Schemes", icon: Landmark },
    { href: "/opportunities", label: "Catalog", icon: Layers },
    { href: "/states", label: "By State", icon: MapPin },
    { href: "/matching", label: "AI Matcher", icon: Sparkles, isHighlight: true },
    { href: "/ai-assistant", label: "AI Advisor", icon: Bot },
  ];

  const bottomMobileLinks = [
    { href: "/", label: "Home", icon: Compass },
    { href: "/scholarships", label: "Explore", icon: GraduationCap },
    { href: "/matching", label: "Match", icon: Sparkles, isHighlight: true },
    { href: "/saved", label: "Saved", icon: Bookmark, badge: savedIds.length },
    {
      href: user ? "/dashboard" : "/login",
      label: user ? "Dashboard" : "Sign In",
      icon: user ? LayoutDashboard : User,
    },
  ];

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Top Demo Alert Banner */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 text-center border-b border-slate-800 flex flex-wrap items-center justify-between sm:justify-center gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 text-[10px] uppercase tracking-wider">
            National Hackathon Prototype
          </span>
          <span className="hidden sm:inline text-slate-300 text-xs">
            OpportunityX-AI: Verified Pre-Screening & Discovery Engine for Indian Citizen Benefits
          </span>
          <span className="sm:hidden text-slate-300 text-xs">OpportunityX-AI Engine</span>
        </div>
        <Link
          href="/admin"
          className="ml-auto sm:ml-4 text-[11px] font-bold text-amber-300 hover:text-amber-200 inline-flex items-center gap-1 underline underline-offset-2 transition-colors focus-visible:ring-1 focus-visible:ring-amber-300"
          aria-label="Open Admin Sandbox"
        >
          <span>Admin Sandbox</span>
          <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1 py-0.2 rounded font-mono">DEMO</span>
        </Link>
      </div>

      {/* Main Desktop & Tablet Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus-visible:rounded-lg"
              aria-label="OpportunityX-AI Home"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-600 flex items-center justify-center shadow-xs text-white">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                    Opportunity<span className="text-brand-600">X</span>
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-brand-50 text-brand-700 border border-brand-200">
                    AI
                  </span>
                </div>
                <span className="text-[10px] font-medium text-slate-500 tracking-wider hidden sm:block">
                  National Benefits Engine
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      link.isHighlight
                        ? "bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200"
                        : active
                        ? "bg-slate-100 text-brand-600 font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${link.isHighlight ? "text-brand-600 animate-pulse" : ""}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Icons & Profile */}
            <div className="hidden md:flex items-center gap-2">
              <DatabaseStatusBadge />

              <Link
                href="/saved"
                className={`p-2 rounded-xl border transition-all relative ${
                  isActive("/saved")
                    ? "bg-brand-50 text-brand-600 border-brand-200"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
                title="Saved Opportunities Tracker"
                aria-label={`Saved Opportunities (${savedIds.length})`}
              >
                <Bookmark className="w-4 h-4" />
                {savedIds.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {savedIds.length}
                  </span>
                )}
              </Link>

              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      isActive("/dashboard")
                        ? "bg-brand-600 text-white border-brand-600 shadow-2xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    href="/profile"
                    className={`flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border text-xs font-medium transition-all ${
                      isActive("/profile")
                        ? "bg-brand-50 border-brand-300 text-brand-700"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                    aria-label="User Profile"
                  >
                    <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                      {(profile?.name || user.email || "U")[0].toUpperCase()}
                    </div>
                    <span className="hidden xl:inline truncate max-w-[110px] font-semibold text-slate-800">
                      {profile?.name || user.email.split("@")[0]}
                    </span>
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-3.5 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors shadow-2xs"
                  >
                    Create Profile
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Top Header Action Controls */}
            <div className="lg:hidden flex items-center gap-2">
              <Link
                href="/saved"
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 relative"
                aria-label={`Saved Opportunities (${savedIds.length})`}
              >
                <Bookmark className="w-5 h-5" />
                {savedIds.length > 0 && (
                  <span className="absolute 1 top-1 right-1 min-w-4 h-4 px-1 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {savedIds.length}
                  </span>
                )}
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-hidden"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500">Database Engine:</span>
              <DatabaseStatusBadge />
            </div>

            <div className="grid grid-cols-2 gap-2 pb-2">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                  >
                    <LayoutDashboard className="w-4 h-4 text-brand-600" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                  >
                    <User className="w-4 h-4 text-brand-600" />
                    <span className="truncate">{profile?.name || "Profile"}</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center p-2.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-800"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center p-2.5 rounded-xl bg-brand-600 text-xs font-bold text-white shadow-2xs"
                  >
                    Create Profile
                  </Link>
                </>
              )}
            </div>

            <nav className="space-y-1" aria-label="Mobile Navigation Drawer">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      active
                        ? "bg-brand-50 text-brand-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-brand-600" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* ─────────────────────────────────────────────────────────────
          MOBILE BOTTOM APP NAVIGATION BAR (Native App Feel on Mobile)
          ───────────────────────────────────────────────────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1.5"
        aria-label="Mobile Bottom App Bar"
      >
        <div className="grid grid-cols-5 items-center">
          {bottomMobileLinks.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.label}
                href={tab.href}
                className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-colors relative ${
                  active ? "text-brand-600 font-bold" : "text-slate-500 hover:text-slate-800 font-medium"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 ${
                      tab.isHighlight && active ? "text-brand-600" : active ? "text-brand-600" : "text-slate-500"
                    }`}
                  />
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="absolute -top-1 -right-2.5 min-w-4 h-4 px-1 bg-emerald-600 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight truncate max-w-full">
                  {tab.label}
                </span>
                {active && (
                  <span className="w-1 h-1 rounded-full bg-brand-600 mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};
