// app/dashboard/layout.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarCheck,
  HeartPulse,
  History,
  LayoutDashboard,
  Medal,
  Settings,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  User as UserIcon,
  Search,
  Bell,
  Star,
  Wifi,
  WifiOff,
  Battery,
  Clock,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Keyboard
} from "lucide-react";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { User } from "@supabase/supabase-js";
import { UserProfile } from "@/types/supabase";
import clsx from "clsx";

/* ---------- TYPES ---------- */
interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge: number;
  category: "main" | "data" | "settings";
  keywords: string[];
  shortcuts?: string[];
  isNew?: boolean;
  isComingSoon?: boolean;
  requiresPro?: boolean;
}

/* ---------- STATIC DATA ---------- */
const nav: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    badge: 0,
    category: "main",
    keywords: ["home", "overview", "main", "dashboard"],
    shortcuts: ["⌘", "1"]
  },
  {
    name: "My Calendars",
    href: "/dashboard/calendars",
    icon: <CalendarCheck className="w-5 h-5" />,
    badge: 0,
    category: "main",
    keywords: ["calendar", "schedule", "events", "appointments"],
    shortcuts: ["⌘", "2"],
    isNew: true
  },
  {
    name: "Progress",
    href: "/dashboard/progress",
    icon: <TrendingUp className="w-5 h-5" />,
    badge: 0,
    category: "data",
    keywords: ["progress", "analytics", "stats", "charts"],
    shortcuts: ["⌘", "3"]
  },
  {
    name: "Achievements",
    href: "/dashboard/achievements",
    icon: <Medal className="w-5 h-5" />,
    badge: 0,
    category: "main",
    keywords: ["achievements", "badges", "rewards", "goals"],
    shortcuts: ["⌘", "4"]
  },
  {
    name: "Habits",
    href: "/dashboard/habits",
    icon: <HeartPulse className="w-5 h-5" />,
    badge: 0,
    category: "main",
    keywords: ["habits", "routines", "health", "tracking"],
    shortcuts: ["⌘", "5"],
    requiresPro: true
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: <TrendingUp className="w-5 h-5" />,
    badge: 0,
    category: "data",
    keywords: ["analytics", "insights", "reports", "data"],
    isComingSoon: true
  },
  {
    name: "History",
    href: "/dashboard/history",
    icon: <History className="w-5 h-5" />,
    badge: 0,
    category: "data",
    keywords: ["history", "past", "timeline", "archive"],
    shortcuts: ["⌘", "6"]
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="w-5 h-5" />,
    badge: 0,
    category: "settings",
    keywords: ["settings", "preferences", "config", "options"],
    shortcuts: ["⌘", ","]
  }
];

/* ---------- LAYOUT COMPONENT ---------- */
export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  /* ---- STATE ---- */
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showKeys, setShowKeys] = useState(false);

  const [pinned, setPinned] = useState<string[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);

  const [category, setCategory] = useState<"all" | "main" | "data" | "settings">(
    "all"
  );

  function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
      const check = () => setIsMobile(window.innerWidth < 1024);
      check();
      window.addEventListener("resize", check);
      return () => window.removeEventListener("resize", check);
    }, []);
    return isMobile;
  }

  const [appState, setAppState] = useState({
    isOnline: true,
    battery: 85,
    notifications: 3,
    unreadMessages: 7,
    currentTime: "",
    soundEnabled: true,
    focusMode: false
  });

  /* ---- MEMOIZED NAV ---- */
  const filtered = useMemo(() => {
    let items = nav.filter(
      (i) =>
        !hidden.includes(i.href) &&
        (category === "all" || i.category === category) &&
        (!searchQuery ||
          i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.keywords.some((k) => k.includes(searchQuery.toLowerCase())))
    );
    items.sort((a, b) => {
      const ap = pinned.includes(a.href);
      const bp = pinned.includes(b.href);
      if (ap && !bp) return -1;
      if (!ap && bp) return 1;
      return a.name.localeCompare(b.name);
    });
    return items;
  }, [searchQuery, category, pinned, hidden]);

  /* ---- SIDE EFFECTS ---- */
  useEffect(() => {
    const tick = () =>
      setAppState((p) => ({
        ...p,
        currentTime: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })
      }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const up = () => setAppState((p) => ({ ...p, isOnline: true }));
    const down = () => setAppState((p) => ({ ...p, isOnline: false }));
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  useEffect(() => {
    (navigator as any).getBattery?.()?.then((b: any) => {
      const update = () =>
        setAppState((p) => ({ ...p, battery: Math.round(b.level * 100) }));
      update();
      b.addEventListener("levelchange", update);
    });
  }, []);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod) {
        switch (e.key) {
          case "k":
            e.preventDefault();
            setShowSearch(true);
            setTimeout(() => searchInputRef.current?.focus(), 100);
            return;
          case "b":
            e.preventDefault();
            setIsCollapsed((c) => !c);
            return;
          case "/":
            e.preventDefault();
            setShowKeys(true);
            return;
          case "f":
            e.preventDefault();
            setAppState((p) => ({ ...p, focusMode: !p.focusMode }));
            return;
          case ",":
            e.preventDefault();
            router.push("/dashboard/settings");
            return;
          case "1":
          case "2":
          case "3":
          case "4":
          case "5":
          case "6":
            e.preventDefault();
            router.push(nav[parseInt(e.key) - 1]?.href || "/dashboard");
            return;
        }
      }
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        setShowSearch(false);
        setShowKeys(false);
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [router]);

  useEffect(() => {
    setIsMounted(true);
    const r = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
      if (window.innerWidth < 1024 && window.innerWidth >= 768) setIsCollapsed(true);
    };
    r();
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  useEffect(() => {
    (async () => {
      const supabase = await createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);
      const { data } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(data);
    })();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const t = localStorage.getItem("theme");
    const c = localStorage.getItem("sidebarCollapsed") === "true";
    const p = JSON.parse(localStorage.getItem("pinnedItems") || "[]");
    const h = JSON.parse(localStorage.getItem("hiddenItems") || "[]");
    const s = localStorage.getItem("soundEnabled") !== "false";

    setIsCollapsed(c);
    setPinned(p);
    setHidden(h);
    setAppState((st) => ({ ...st, soundEnabled: s }));

    if (t === "dark" || (!t && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  /* ---- HANDLERS ---- */
  const toggleTheme = useCallback(() => {
    setIsDark((d) => {
      const next = !d;
      localStorage.setItem("theme", next ? "dark" : "light");
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }, []);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((c) => {
      const next = !c;
      localStorage.setItem("sidebarCollapsed", String(next));
      return next;
    });
  }, []);

  const togglePin = useCallback((href: string) => {
    setPinned((p) => {
      const next = p.includes(href) ? p.filter((i) => i !== href) : [...p, href];
      localStorage.setItem("pinnedItems", JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleHide = useCallback((href: string) => {
    setHidden((h) => {
      const next = h.includes(href) ? h.filter((i) => i !== href) : [...h, href];
      localStorage.setItem("hiddenItems", JSON.stringify(next));
      return next;
    });
  }, []);

  const signOut = async () => {
    const supabase = await createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  /* ---- RENDER ---- */
  if (!isMounted) return null;

  /* Sidebar shared between desktop & mobile */
  const sidebarContent = (
    <>
      {/* Header */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center">
            <Image
              src={isDark ? "/assets/phasely-logo.svg" : "/assets/phasely-logo-2.svg"}
              alt="Logo"
              width={120}
              height={32}
              className={clsx(
                "h-8 w-auto transition-all duration-300",
                isCollapsed && "lg:opacity-0 lg:w-0"
              )}
            />
          </Link>

          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1">
              {appState.isOnline ? (
                <Wifi className="w-3 h-3 text-green-500" />
              ) : (
                <WifiOff className="w-3 h-3 text-red-500" />
              )}
              {appState.battery < 20 && <Battery className="w-3 h-3 text-red-500" />}
            </div>

            <button
              onClick={toggleCollapse}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search or press ⌘K"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-4 py-2 text-sm rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto pb-1">
              {(["all", "main", "data", "settings"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={clsx(
                    "px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors",
                    category === c
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  )}
                >
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {filtered.map((item) => {
          const active = pathname === item.href;
          const section = pathname.startsWith(item.href) && item.href !== "/dashboard";
          const pinnedItem = pinned.includes(item.href);

          return (
            <div key={item.name} className="group relative">
              <Link
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={clsx(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 relative",
                  active || section
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 shadow-sm"
                    : "text-gray-700 dark:text-gray-300",
                  item.isComingSoon && "opacity-60 pointer-events-none"
                )}
              >
                {(active || section) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 top-0 h-full w-1 bg-blue-600 dark:bg-blue-400 rounded-r-full"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="relative w-6 h-6 shrink-0">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    {item.icon}
                  </motion.div>
                  {item.badge > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold"
                    >
                      {item.badge > 99 ? "99+" : item.badge}
                    </motion.span>
                  )}
                </div>
                <div
                  className={clsx(
                    "flex-1 flex items-center justify-between",
                    isCollapsed && "lg:opacity-0 lg:translate-x-2"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate">{item.name}</span>
                    {item.isNew && (
                      <span className="px-1.5 py-0.5 text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded">
                        NEW
                      </span>
                    )}
                    {item.requiresPro && (
                      <span className="px-1.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded">
                        PRO
                      </span>
                    )}
                    {item.isComingSoon && (
                      <span className="px-1.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded">
                        SOON
                      </span>
                    )}
                  </div>
                  {item.shortcuts && (
                    <div className="flex gap-0.5">
                      {item.shortcuts.map((k, idx) => (
                        <kbd key={idx} className="px-1 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded">
                          {k}
                        </kbd>
                      ))}
                    </div>
                  )}
                </div>
                {pinnedItem && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
              </Link>

              {!isCollapsed && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      togglePin(item.href);
                    }}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    title={pinnedItem ? "Unpin" : "Pin"}
                  >
                    <Star
                      className={clsx(
                        "w-3 h-3",
                        pinnedItem ? "text-yellow-500 fill-current" : "text-gray-400"
                      )}
                    />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleHide(item.href);
                    }}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Hide"
                  >
                    <EyeOff className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {hidden.length > 0 && !isCollapsed && (
          <button
            onClick={() => setHidden([])}
            className="w-full text-left px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            Show {hidden.length} hidden item{hidden.length > 1 ? "s" : ""}
          </button>
        )}
      </nav>

      {/* System status */}
      {!isCollapsed && (
        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              <span>{appState.currentTime}</span>
            </div>
            <div className="flex items-center gap-2">
              {appState.notifications > 0 && (
                <div className="flex items-center gap-1">
                  <Bell className="w-3 h-3" />
                  <span>{appState.notifications}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Battery className="w-3 h-3" />
                <span>{appState.battery}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User section */}
      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 py-2">
          <div className="relative w-10 h-10 shrink-0">
            {user?.user_metadata?.avatar_url ? (
              <Image
                src={user.user_metadata.avatar_url}
                alt="Avatar"
                fill
                className="rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
            )}
            <div
              className={clsx(
                "absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white dark:border-gray-800 rounded-full",
                appState.isOnline ? "bg-green-400" : "bg-gray-400"
              )}
            />
          </div>
          <div
            className={clsx(
              "flex-1 min-w-0 transition-all duration-300",
              isCollapsed && "lg:opacity-0 lg:translate-x-2"
            )}
          >
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {user?.email?.split("@")[0] || "User"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-start gap-2">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <motion.div
              initial={false}
              animate={{ rotate: isDark ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.div>
          </button>

          <button
            onClick={() =>
              setAppState((p) => {
                const next = !p.soundEnabled;
                localStorage.setItem("soundEnabled", String(next));
                return { ...p, soundEnabled: next };
              })
            }
            className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            title={appState.soundEnabled ? "Mute sounds" : "Enable sounds"}
          >
            {appState.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowKeys(true)}
            className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Keyboard shortcuts (⌘/)"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          <button
            onClick={signOut}
            className={clsx(
              "flex items-center justify-center gap-2 w-10 h-10 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20",
              "justify-center",
              isCollapsed && "lg:justify-center w-10 h-10 flex lg:items-center lg:px-2"
            )}
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
            <span
              className={clsx(
                "transition-all hidden lg:block duration-300",
                isCollapsed && "lg:opacity-0 lg:w-0 lg:overflow-hidden"
              )}
            >
              Sign out
            </span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div
      className={clsx(
        "flex w-full h-screen",
        "bg-gray-50 dark:bg-gray-900",
        appState.focusMode && "bg-gray-100 dark:bg-gray-950"
      )}
    >
      {/* Mobile menu button */}
      <motion.button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 flex items-center justify-center w-12 h-12 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Menu className="w-6 h-6" />
        {(appState.notifications || appState.unreadMessages) > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
            {(appState.notifications + appState.unreadMessages) > 99
              ? "99+"
              : appState.notifications + appState.unreadMessages}
          </span>
        )}
      </motion.button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block" >
        <motion.aside
          animate={{ width: isCollapsed ? 72 : 320 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={clsx(
            "hidden lg:flex flex-col shrink-0 h-full z-30 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm py-6 px-3",
            appState.focusMode && "bg-gray-50 dark:bg-gray-850"
          )}
        >
          {sidebarContent}
        </motion.aside>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden fixed left-0 top-0 h-full w-80 max-w-[85vw] z-50 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col p-6 shadow-2xl"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main
        className={clsx(
          "flex-1 flex flex-col overflow-hidden",
          "pt-20 lg:pt-0",
          appState.focusMode && "pt-24 lg:pt-4"
        )}
      >
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">{children}</div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showKeys && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setShowKeys(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Keyboard Shortcuts</h3>
                <button
                  onClick={() => setShowKeys(false)}
                  className="p-1 rounded text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Navigation</h4>
                  {nav.slice(0, 6).map((it, i) => (
                    <div key={it.name} className="flex justify-between py-1 text-sm">
                      <span>{it.name}</span>
                      <div className="flex gap-1">
                        <kbd className="px-1 bg-gray-100 dark:bg-gray-700 rounded">⌘</kbd>
                        <kbd className="px-1 bg-gray-100 dark:bg-gray-700 rounded">{i + 1}</kbd>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">General</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span>Search</span><div className="flex gap-1"><kbd>⌘</kbd><kbd>K</kbd></div></div>
                    <div className="flex justify-between"><span>Toggle Sidebar</span><div className="flex gap-1"><kbd>⌘</kbd><kbd>B</kbd></div></div>
                    <div className="flex justify-between"><span>Focus Mode</span><div className="flex gap-1"><kbd>⌘</kbd><kbd>F</kbd></div></div>
                    <div className="flex justify-between"><span>Settings</span><div className="flex gap-1"><kbd>⌘</kbd><kbd>,</kbd></div></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 p-4 backdrop-blur-sm"
            onClick={() => setShowSearch(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: -20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: -20, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 max-w-2xl w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search navigation, settings, or help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border-0 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              {searchQuery && (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {filtered.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setShowSearch(false);
                      }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{item.category}</p>
                      </div>
                      {item.shortcuts && (
                        <div className="flex gap-0.5">
                          {item.shortcuts.map((k, i) => (
                            <kbd key={i} className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 rounded">
                              {k}
                            </kbd>
                          ))}
                        </div>
                      )}
                    </Link>
                  ))}
                  {filtered.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No results found</p>
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  <span>
                    Press <kbd className="px-1 bg-gray-200 dark:bg-gray-600 rounded">↑↓</kbd> to navigate
                  </span>
                  <span>
                    Press <kbd className="px-1 bg-gray-200 dark:bg-gray-600 rounded">Enter</kbd> to select
                  </span>
                </div>
                <span>
                  Press <kbd className="px-1 bg-gray-200 dark:bg-gray-600 rounded">Esc</kbd> to close
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Focus mode indicator */}
      <AnimatePresence>
        {appState.focusMode && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-sm font-medium shadow-lg z-40 flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Focus Mode Active
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}